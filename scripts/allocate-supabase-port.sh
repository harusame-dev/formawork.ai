#!/usr/bin/env bash
set -eo pipefail

# プロジェクト内の .env ファイルにある PUT_YOUR_SUPABASE_PORT_* プレースホルダーを
# 空きポートに置き換える。同じプレースホルダーには全ファイルで同一のポートを割り当てる。
# .env が無く .env.sample がある場所には .env を作成してから置換する。

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# メインリポジトリで最初に実行すると従来どおり 62021（API）・62022（DB）・62023（Studio）が
# 割り当たるよう、開始値を既存の慣習に合わせている
PORT_MIN=62021
PORT_MAX=62999

# この worktree 配下にネストした他の worktree（.claude/worktrees/ など）は対象外にする
prune_args=()
while IFS= read -r wt; do
  [ "$wt" = "$ROOT" ] && continue
  case "$wt" in
    "$ROOT"/*) prune_args+=(-o -path "$wt") ;;
  esac
done < <(git -C "$ROOT" worktree list --porcelain 2> /dev/null | sed -n 's/^worktree //p')

find_project_files() {
  find "$ROOT" \
    \( -name node_modules -o -name .git -o -name .entire ${prune_args[@]+"${prune_args[@]}"} \) -prune \
    -o -type f "$@" -print
}

# 停止中の worktree 環境とも衝突しないよう、lsof（起動中のリスナー）に加えて
# 他 worktree の .env に割り当て済みのポートも使用済みとして扱う
reserved_ports() {
  { git -C "$ROOT" worktree list --porcelain 2> /dev/null || true; } | sed -n 's/^worktree //p' \
    | while IFS= read -r wt; do
      [ "$wt" = "$ROOT" ] && continue
      [ -d "$wt" ] || continue
      find "$wt" \( -name node_modules -o -name .git \) -prune \
        -o -type f -name '.env*' ! -name '*.sample' \
        -exec grep -hE '^[A-Za-z_]*PORT[A-Za-z_]*=[0-9]+$' {} + 2> /dev/null || true
    done | cut -d= -f2
}

used_ports=" $(reserved_ports | tr '\n' ' ') "
next_candidate=$PORT_MIN
allocated=""

allocate_port() {
  local p=$next_candidate
  while [ "$p" -le "$PORT_MAX" ]; do
    case "$used_ports" in
      *" $p "*)
        p=$((p + 1))
        continue
        ;;
    esac
    if lsof -nP -iTCP:"$p" -sTCP:LISTEN > /dev/null 2>&1; then
      p=$((p + 1))
      continue
    fi
    used_ports="${used_ports}${p} "
    next_candidate=$((p + 1))
    allocated=$p
    return 0
  done
  echo "エラー: ${PORT_MIN}-${PORT_MAX} の範囲に空きポートがありません" >&2
  return 1
}

while IFS= read -r sample; do
  env_file="${sample%.sample}"
  if [ ! -f "$env_file" ]; then
    cp "$sample" "$env_file"
    echo "作成: ${env_file#"$ROOT"/}"
  fi
done < <(find_project_files -name '.env*.sample')

env_files=()
while IFS= read -r f; do
  env_files+=("$f")
done < <(find_project_files -name '.env*' ! -name '*.sample')

if [ ${#env_files[@]} -eq 0 ]; then
  echo "対象の .env ファイルが見つかりません"
  exit 0
fi

placeholders=$(grep -hoE 'PUT_YOUR_SUPABASE_PORT_[A-Za-z0-9_]+' "${env_files[@]}" 2> /dev/null | sort -u || true)

if [ -z "$placeholders" ]; then
  echo "置換対象のプレースホルダーはありません（割り当て済み）"
  exit 0
fi

for ph in $placeholders; do
  allocate_port
  port=$allocated
  for f in "${env_files[@]}"; do
    grep -q "$ph" "$f" || continue
    # _API と _API2 のような前方一致の誤置換を防ぐため、後ろに識別子文字が続く場合は置換しない
    sed -E -i.bak "s/${ph}([^A-Za-z0-9_]|\$)/${port}\\1/g" "$f"
    rm -f "${f}.bak"
    echo "割り当て: ${ph} -> ${port} (${f#"$ROOT"/})"
  done
done
