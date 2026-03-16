---
paths:
  - "packages/db/src/schema/*.ts"
---

# DB スキーマ定義ルール

## テーブル定義

### pgSchema の使用

デプロイ環境ごとにスキーマを分離するため、テーブル定義には必ず `packages/db/src/pgschema.ts` が提供する `schemaName` を使用して `pgSchema(schemaName).table(...)` でテーブルを定義すること。

```typescript
import { pgSchema } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

export const exampleTable = pgSchema(schemaName).table("example", {
  // ...
});
```

`schemaName` はローカル環境では `"local"`、リモート環境では `"${appName}_${serviceName}_${branchName}"` に解決される。

## RLS（Row Level Security）

### 方針

- **全テーブルで RLS を有効化**（`.enableRLS()`）
- **ポリシーは作成しない**（デフォルト拒否）
- **認可ロジックはアプリケーションレイヤーで実装**

### 理由

| 観点           | RLS による認可                   | アプリケーションによる認可（採用） |
| -------------- | -------------------------------- | ---------------------------------- |
| 凝集度         | 認可ロジックが DB に分散         | 認可ロジックがアプリに集約         |
| 可読性         | SQL ポリシーを確認する必要がある | コードベースで完結                 |
| テスタビリティ | ポリシーのテストが困難           | ユニットテスト可能                 |
| デバッグ       | 暗黙的な拒否で原因特定が困難     | 明示的なエラーハンドリング         |

### RLS の役割

RLS を有効化してポリシーを作成しない場合、**サービスロール以外のアクセスはすべて拒否**される。

- フェイルセーフ: アプリケーション層をバイパスされた場合の防御
- デフォルト拒否: 明示的に許可しない限りアクセス不可

### 新規テーブル作成時

新規テーブルを作成する場合は、必ず `.enableRLS()` を付与すること。
