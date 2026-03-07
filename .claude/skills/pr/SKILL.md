---
name: pr
description: GitHub の Pull Request を自動作成するスキル。 「PR を作って」「プルリクを作成して」「PR を出して」「レビュー依頼したい」など、 PR 作成・提出に関する指示があれば必ずこのスキルを使用すること。 GitHub Issues からチケットの内容を取得し、git log でベースブランチを特定、 git diff からコンテキストを把握した上で、所定のテンプレートを使って develop ブランチへの PR を作成する。
context: fork
---

# PR 作成スキル

## 概要

1. git log からベースブランチを自動特定
2. GitHub Issues からチケット内容を取得
3. 差分（git diff）を確認してコンテキストを把握
4. テンプレートに従って PR 本文を生成
5. リモートへ push
6. `gh pr create` で PR を作成（`context:fork` 有効）

---

## 前提条件

- `gh` CLI がインストール・認証済みであること
- カレントディレクトリが対象リポジトリであること
- 現在のブランチが作業ブランチであること（develop / main ではないこと）

---

## ステップ 1: ベースブランチの自動特定

git log を使って、現在のブランチが分岐した元のブランチを特定する。

```bash
# まずリモートの最新情報を取得
git fetch origin

# 各候補ブランチとのコミット差を確認（数値が小さいほど近い分岐点）
for base in develop main master; do
  count=$(git rev-list origin/$base..HEAD --count 2>/dev/null)
  [ -n "$count" ] && echo "$count commits ahead of origin/$base"
done
```

コミット差が最も少ないブランチをベースブランチとして採用する。
通常は `develop` になる想定。特定できない場合はユーザーに確認する。

---

## ステップ 2: GitHub Issues からチケット取得

### ブランチ名から Issue 番号を抽出

```bash
git branch --show-current
```

ブランチ名のパターン例：

- `feature/123-add-login` → #123
- `fix/456-bug-fix` → #456
- `123-some-feature` → #123

数字が見つかった場合：

```bash
gh issue view <ISSUE_NUMBER> --json title,body,labels,assignees,milestone
```

Issue 番号がブランチ名から取れない場合は、ユーザーに番号を確認する。

---

## ステップ 3: 差分の確認

```bash
# 変更ファイルの一覧とサマリ
git diff <BASE_BRANCH>...HEAD --stat

# コミット一覧
git log <BASE_BRANCH>..HEAD --oneline

# 変更ファイルのステータス
git diff <BASE_BRANCH>...HEAD --name-status
```

---

## ステップ 4: PR 本文の生成

以下のテンプレートに必ず従うこと：

```markdown
## 概要

<!-- 作業内容の概要を1〜3文で記述 -->

## やったこと

<!-- 変更内容を箇条書きで記述（コミット単位ではなく機能・変更単位で） -->

-

## 補足

<!-- レビュアーへの注意点・実装上のトレードオフ・懸念点など -->
<!-- 特になければ「特になし」と記載 -->

## 参考

<!-- Issue へのリンクは必須 -->

- closes #<ISSUE_NUMBER>
<!-- 関連する Slack スレッド・ドキュメント・参考 URL があれば追記 -->
```

### 各セクションの生成指針

| セクション | 生成方法                                                     |
| ---------- | ------------------------------------------------------------ |
| 概要       | Issue タイトル・本文の目的 + 差分の概要から1〜3文            |
| やったこと | `git log --oneline` と `--stat` をベースに機能単位で箇条書き |
| 補足       | 実装の判断・注意点。差分から読み取れない情報を中心に         |
| 参考       | `closes #番号` 必須。Issue がない場合は省略                  |

---

## ステップ 5: リモートへ push

PR 作成前に必ず実行する。

```bash
git push -u origin <current-branch>
```

push に失敗した場合はエラー内容をユーザーに提示し、PR 作成を中断する。

---

## ステップ 6: PR の作成

PR 本文を表示してユーザーに確認を取ってから実行する。

```bash
gh pr create \
  --base <BASE_BRANCH> \
  --title "<PR タイトル>" \
  --body "<生成した本文>" \
  --draft
```

### タイトルの命名規則

```
<Issue タイトルをベースにした要約>
```

ユーザーから指定がない場合は `--draft` のみ付与する。

---

## エラーハンドリング

| エラー                         | 対処                                               |
| ------------------------------ | -------------------------------------------------- |
| `gh: command not found`        | `brew install gh` または公式インストール手順を案内 |
| `gh auth` エラー               | `gh auth login` を促す                             |
| `origin/<base>` が見つからない | `git fetch origin` を先に実行                      |
| `git push` 失敗                | エラー内容を提示して中断                           |
| PR が既に存在する              | 既存 PR の URL を表示して確認を促す                |
| Issue が見つからない           | 番号の再確認を促す                                 |

---

## 出力例

PR 作成後は以下を表示する：

```
✅ PR を作成しました

タイトル: ログイン機能の実装
URL: https://github.com/owner/repo/pull/42
ベース: develop ← feature/42-add-login
ステータス: Draft
```
