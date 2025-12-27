---
name: searching-library-api
description: 外部依存のライブラリの設定、コーディングを行う際は明示しなくても必ずこのスキルを使用し、使用するバージョンにマッチする最新の情報を使用します
allowed-tools: Bash(git branch:*), Bash(git status:*), Bash(git --no-pager log:*), Bash(git --no-pager diff:*), Bash(git ls-remote:*), Bash(git push:*), Bash(git remote:*), Bash(pnpm -w validate:check:*), mcp__github
---

# ライブラリ API 検索

Context7 の API を使用して指定されたライブラリの情報を取得します。

## ワークフロー

進捗に合わせてチェックを入れてください：
ステップ1、2は並列で実行します。
ステップ1、2がどちらも成功したらステップ3、4を並列で実行します。


```
PR操作の進捗:
- [ ] ステップ1: 対象のライブラリのバージョンを取得する
- [ ] ステップ2: ドキュメントを利用可能なライブラリを検索
- [ ] ステップ3: 対象のライブラリのスニペットを取得する
- [ ] ステップ4: 対象のライブラリのドキュメントを取得する
```

### ステップ1: 対象のライブラリのバージョンを取得する

#### プロンプトとしてバージョンが指定されている場合

 バージョンが明示されていればそのバージョンを採用する

#### プロンプトとしてバージョンが指定されていない場合

パッケージマネージャーの設定ファイルからバージョンを取得する

eg: 16.1.0

- package.json
- pnpm-workspace.yaml

#### バージョンが取得できなかった場合

「バージョンが取得できなかったため、ドキュメントの取得ができませんでした」と出力し処理を終了する

### ステップ2: ドキュメントを利用可能なライブラリを検索する

ライブラリの検索 API を使用しライブラリの ID 形式（`/owner/repo`）を取得します。

```sh
curl "https://context7.com/api/v2/search?query=ライブラリ名" -H "Authorization: Bearer ${CONTEXT7_API_KEY}" 
```
eg: curl "https://context7.com/api/v2/search?query=next.js" -H "Authorization: Bearer ${CONTEXT7_API_KEY}" 

### ステップ3: 対象のライブラリのスニペットを取得する

スニペットの取得 API （./api/get-code-snippets-with-version.md）を用いてスニペットを取得します。

```sh
curl https://context7.com/api/v2/docs/code/owner/repo/version -H "Authorization: Bearer ${CONTEXT7_API_KEY}" 
```

eg: curl "https://context7.com/api/v2/docs/code/vercel/next.js/v16.1.0" -H "Authorization: Bearer ${CONTEXT7_API_KEY}" 


### ステップ4: 対象のライブラリのドキュメントを取得する



ドキュメントの取得 API （./api/get-documentation-with-version.md）を用いてスニペットを取得します。

```sh
curl https://context7.com/api/v2/docs/info/owner/repo/version -H "Authorization: Bearer ${CONTEXT7_API_KEY}" 
```

eg: curl "https://context7.com/api/v2/docs/info/vercel/next.js/v16.1.0" -H "Authorization: Bearer ${CONTEXT7_API_KEY}" 
