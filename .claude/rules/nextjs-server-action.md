---
paths:
  - *.server.action.ts
  - actions.ts
---

# Next.js Server Actions

## 認証・認可・バリデーション

フロントエンドで認証・認可・バリデーションを行っているいないに関わらず、 認証・認可・バリデーションを実施する

- Server Action の定義には createServerAction を使用する

## ロジックの分離

直接ロジックを書くのではなく、別関数に切り出す
Server Action では、認証、認可、バリデーション、 HTTP 層のデータとユースケースのパラメーター変換、ユースケースの呼び出しを責務とする
