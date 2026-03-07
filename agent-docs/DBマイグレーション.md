# データベースマイグレーションガイド

## 環境構成

| 環境     | スキーマ                                       | Supabase Auth                 |
| -------- | ---------------------------------------------- | ----------------------------- |
| ローカル | `local`                                       | 独立（ローカル Supabase CLI） |
| リモート | `${APP_NAME}__${SERVICE_NAME}__${BRANCH_NAME}` | 共用（1プロジェクト）         |

### ローカル環境

- Supabase CLI でローカル Supabase を起動するため、Auth を含め完全に独立した環境

### リモート環境

- 本番・検証・プレビューすべて同一 Supabase プロジェクトを使用
- スキーマ（名前空間）で環境を分離
- **スキーマ名は小文字**

### 環境変数（リモート環境）

| 変数名         | 説明       | 設定方法                             |
| -------------- | ---------- | ------------------------------------ |
| `APP_NAME`     | アプリ名   | 手動設定（必須）                     |
| `SERVICE_NAME` | サービス名 | 手動設定（必須）                     |
| `BRANCH_NAME`  | ブランチ名 | `VERCEL_GIT_COMMIT_REF` から自動取得 |

**スキーマ名の例**: `formawork_ai__web__feature_create_user`

**命名規則**: `\W`（英数字・アンダースコア以外）は `_` に置換
- 例: `feature/create_user` → `feature_create_user`

## マイグレーション手順

Drizzle スキーマ定義（`packages/db/src/schema/`）を更新後、以下を実行する。

### 1. マイグレーションファイル生成

```bash
pnpm -w db:generate
```

### 2. SQL の修正（必須）

生成された SQL から `"local".` を削除する。

```sql
-- 修正前
REFERENCES "public"."staffs"("staff_id")

-- 修正後
REFERENCES "staffs"("staff_id")
```

> **なぜ必要か**: スキーマ定義で `pgSchema` を使って local を指定しているため、生成される SQL は `local` スキーマを参照する。リモート環境では環境別スキーマを使用するため、この参照を削除する必要がある。

### 3. マイグレーション実行

```bash
pnpm -w db:migrate
```

## RLS（Row Level Security）

### 方針

- **全テーブルで RLS を有効化**（`.enableRLS()`）
- **ポリシーは作成しない**（デフォルト拒否）
- **認可ロジックはアプリケーションレイヤーで実装**

### 理由

| 観点 | RLS による認可 | アプリケーションによる認可（採用） |
|------|---------------|----------------------------------|
| 凝集度 | 認可ロジックが DB に分散 | 認可ロジックがアプリに集約 |
| 可読性 | SQL ポリシーを確認する必要がある | コードベースで完結 |
| テスタビリティ | ポリシーのテストが困難 | ユニットテスト可能 |
| デバッグ | 暗黙的な拒否で原因特定が困難 | 明示的なエラーハンドリング |

### RLS の役割

RLS を有効化してポリシーを作成しない場合、**サービスロール以外のアクセスはすべて拒否**される。

- フェイルセーフ: アプリケーション層をバイパスされた場合の防御
- デフォルト拒否: 明示的に許可しない限りアクセス不可

### 新規テーブル作成時

新規テーブルを作成する場合は、必ず `.enableRLS()` を付与すること。

```typescript
export const exampleTable = pgSchema(schemaName)
  .table("example", {
    id: uuid("id").primaryKey().defaultRandom(),
    // ...
  })
  .enableRLS();
```

## チェックリスト

- [ ] Drizzle スキーマ定義（`packages/db/src/schema/`）を更新
- [ ] **新規テーブルには `.enableRLS()` を付与**
- [ ] `pnpm -w db:generate` を実行
- [ ] 生成 SQL から `"public".` を削除
- [ ] `pnpm -w db:migrate` を実行
