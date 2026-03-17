---
paths:
  - "packages/db/src/schema/*.ts"
---

# DB スキーマ定義

## pgSchema の使用

- pgSchema(スキーマ名) を使用してスキーマを指定する
- スキーマ名に `packages/db/src/pgschema.ts` が提供する `schemaName` を使用する

## RLS

- 新しいテーブルを定義する際は .enableRLS() を用いて RLS を有効化する
- ポリシーは作成しない
  - 認可はアプリケーションで行うため
