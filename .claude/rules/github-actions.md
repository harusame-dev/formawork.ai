---
paths:
  - ".github/workflows/**"
---

# GitHub Action

GitHub Actions ワークフローは以下のルールに従うこと。

## ステップ名の日本語化

各ステップには日本語でわかりやすい名前を必ず付けること。

例:

- `name: リポジトリのチェックアウト`
- `name: 依存関係のインストール`

## pnpm バージョン

`pnpm/action-setup` で with の version を省略し、`package.json` の `packageManager` フィールドのバージョンを自動使用させること。

## Node.js バージョン

`setup-node` で `.node-version` ファイルを参照すること。

## concurrency 設定

重複実行を防ぐため、原則的に concurrency を設定すること。
設定しない場合はワークフローファイルにその理由をコメントで残すこと。

```yaml
concurrency:
  group: <workflow-name>-${{ github.ref }}
  cancel-in-progress: true
```

## タイムアウト設定

各ジョブには最低でも 10 分のタイムアウトを設定すること。

```yaml
jobs:
  build:
    timeout-minutes: 10
```

## 3rd パーティーアクションのバージョン指定

サードパーティ Actions の指定には、コミット SHA 形式での指定を行うこと

## 無関係なワークフローのスキップ

そのワークフローとは無関係なファイルが更新されたときにワークフローの実行をスキップする。

### マージ条件としてワークフローの pass が必須でない場合

Github Actions 標準の paths-ignore を指定する

### マージ条件としてワークフローのパスが必須の場合

paths-ignore を指定した場合、ワークフロー自体が起動せず、マージが行えなくなってしまうため、 dorny/paths-filter を使用する

```yaml
- name: 変更ファイルの検出
  uses: dorny/paths-filter@fbd0ab8f3e69293af611ebaee6363fc25e6d187d # v4.0.1
  id: filter
  permissions: # dorny/paths-filter には pull-requests の read 権限が必要
    pull-requests: read
  with:
    predicate-quantifier: every # フィルターの条件を AND 条件にするために必要。 default は same で or 条件
    filters: |
      web:
        - 'apps/web/**'  # apps/web ディレクトリ内の任意のファイルを対象とする
        - '!**/*.md'     # And .md ファイルは除外（サーバーテストでドキュメントの更新は無関係なため
        - '!**/eslint.config.mjs' # And eslint.config.mjs は除外（サーバーテストでは ESLint の設定変更は無関係なため
        -
      logger:
        - 'packages/logger/**'
        - '!**/*.md'

- name: 実行要否の判定
  id: should-run
  run: echo "result=${{ steps.filter.outputs.web == 'true' || steps.filter.outputs.logger == 'true' }}" >> $GITHUB_OUTPUT

- name: web のテスト実行
  if: steps.should-run.outputs.result == 'true'
  run: test
```

### 例外条件

以下のいずれかに該当する場合は例外として、コメントでスキップ設定の省略理由を記載すること

- ほとんどのファイルがワークフローの対象
- 実行時間が 3分未満
