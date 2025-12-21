---
name: creating-pr
description: GitHub上にプルリクエストを自動作成・更新する。コミット履歴とコード差分を分析してPRタイトルと説明文を自動生成する。PR新規作成、既存PRの更新、または変更がレビュー対象になった時に使用する。
allowed-tools: Bash(git branch:*), Bash(git status:*), Bash(git --no-pager log:*), Bash(git --no-pager diff:*), Bash(git ls-remote:*), Bash(git push:*), Bash(pnpm -w validate:check:*), mcp__github
---

# GitHub プルリクエスト自動作成・更新

コミット履歴とコード変更から自動生成したタイトルと詳細説明でプルリクエストを作成または更新します。

## ワークフロー

進捗に合わせてチェックを入れてください：

```
PR操作の進捗:
- [ ] ステップ1: 事前条件確認（ブランチ、未コミット変更）
- [ ] ステップ2: バリデーション実行
- [ ] ステップ3: 必要に応じてリモートにpush
- [ ] ステップ4: 既存PRの確認（作成 or 更新を判定）
- [ ] ステップ5: コミットと差分データ収集
- [ ] ステップ6: PRタイトル生成
- [ ] ステップ7: PR説明文生成
- [ ] ステップ8: GitHub上でPR作成 or 更新
```

### ステップ1: 事前条件確認

現在のブランチと作業ディレクトリの状態を確認：

```bash
current_branch=$(git branch --show-current)

# mainブランチではないことを確認
if [ "$current_branch" = "main" ]; then
  echo "❌ エラー: mainブランチからはPR作成できません"
  exit 1
fi

# 未コミット変更がないことを確認
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ エラー: 未コミット変更があります"
  git status --short
  exit 1
fi
```

### ステップ2: バリデーション実行

```bash
pnpm -w validate:check
```

バリデーションが失敗した場合：
- エラー詳細を表示
- code-validator エージェント実行を提案
- PR作成を中止

### ステップ3: リモートへpush

```bash
# リモートブランチの存在確認
remote_exists=$(git ls-remote --heads origin "$current_branch")

# 存在しない場合はpush
if [ -z "$remote_exists" ]; then
  echo "ブランチをリモートにpush中..."
  git push -u origin "$current_branch"
fi
```

### ステップ4: 既存PRの確認（作成 or 更新を判定）

現在のブランチに対応する既存の PR が存在するか確認：

```bash
# GitHub MCP で現在のブランチに対応する PR を検索
# PR が見つかった場合: 既存 PR 番号を取得
# PR が見つからない場合: 新規 PR 作成フロー

# 検索例：
# gh pr list --head $current_branch --state all --json number
```

**判定結果:**
- PR が存在する → **ステップ7へ進み、既存 PR を更新**
- PR が存在しない → **新規 PR 作成フローを実行**

### ステップ5: データ収集

コミット履歴とコード差分情報を収集：

```bash
# コミットメッセージを取得（何が変わったか）
git log main...HEAD --format="%s" --reverse

# ファイル変更を取得（どのファイルが変わったか）
git diff main...HEAD --name-status

# 変更サマリーを取得（追加・削除行数）
git diff main...HEAD --stat
```

### ステップ6: PRタイトル生成

コミットと差分を分析して簡潔な日本語タイトルを生成。

**ガイドライン:**
- コミットメッセージから主要目的を抽出
- 10～30文字で記述
- 説明的かつ簡潔に
- 例: 「顧客メモリをアドバイス生成に反映」「ギャラリーの画像サイズ修正」

### ステップ7: PR説明文生成

以下のフォーマットに従って説明文を作成：

```markdown
## 変更の目的・背景

なぜこの変更が必要か、解決しようとしている問題を記載
（関連する Issue/チケットへのリンクがあれば含める）

## 変更内容の概要

- 主要な変更点を概念レベルで箇条書き
- 技術的な詳細ではなく「何を」変更したかを記載

## 影響範囲

- 影響する機能・画面を記載
- 破壊的変更の有無を明記

## 動作確認方法

- [ ] レビュアーが再現できる形でテスト手順を記載
- [ ] UI変更がある場合はスクリーンショット/動画を添付

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**生成ルール:**
- **変更の目的・背景**: コミットメッセージやブランチ名から目的を推測、関連 Issue があればリンク
- **変更内容の概要**: コミットから主要変更を概念レベルで抽出（技術詳細は避ける）
- **影響範囲**: 変更されたファイルから影響する機能・画面を特定
- **動作確認方法**: 変更内容に応じた具体的なテスト手順を記載

### ステップ8: PR作成または更新

ステップ4で判定した結果に基づいて、PR の作成または更新を実行：

**パターンA: 新規PR作成（ステップ4で PRが見つからない場合）**

```bash
# GitHub MCPを使用してPRを作成
mcp__github__create_pull_request({
  owner: "harusame0616",
  repo: "formawork.ai",
  title: "{生成された日本語タイトル}",
  head: "{current_branch}",
  base: "main",
  body: "{生成された説明文}"
})
```

成功時の出力：
```
✅ PRが作成されました
📍 URL: https://github.com/harusame0616/formawork.ai/pull/NNN
```

**パターンB: 既存PR更新（ステップ4で PRが見つかった場合）**

```bash
# GitHub MCPを使用して既存PRを更新
mcp__github__update_pull_request({
  owner: "harusame0616",
  repo: "formawork.ai",
  pullNumber: {ステップ4で取得したPR番号},
  title: "{生成された日本語タイトル}",
  body: "{生成された説明文}"
})
```

成功時の出力：
```
✅ PRが更新されました
📍 URL: https://github.com/harusame0616/formawork.ai/pull/NNN
```

## エラーハンドリング

| エラー | 確認方法 | 対応方法 |
|-------|--------|--------|
| mainブランチ上 | `git branch --show-current` | feature ブランチに切り替えてください |
| 未コミット変更あり | `git status --porcelain` | PR作成前にコミットしてください |
| バリデーション失敗 | `pnpm -w validate:check` 出力 | code-validator エージェントでエラーを修正 |
| リモートpush失敗 | git エラーメッセージ | git設定とパーミッションを確認 |
| GitHub API失敗 | MCP エラーレスポンス | GitHub認証を確認 |

## 前提条件

- 現在のブランチが `main` ではないこと
- すべての変更がコミットされていること
- バリデーションチェックがパスしていること
- リモートブランチが存在しない場合は自動作成される
