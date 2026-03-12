# チケット 08: 削除ログ機能

## 概要

案件・タスクの物理削除時に、削除されたレコードの内容・操作日時・操作者を
`deletion_logs` テーブルに記録する。管理者向けの削除ログ閲覧画面も実装する。

## 背景

物理削除を採用するため、削除されたデータの追跡・監査ができるよう記録が必要。
PostgreSQL トリガーではなく **アプリ側で削除直前にログを INSERT する** 方式を採用する。
（理由：トリガーは操作者情報の取得が複雑になるため）

## 前提チケット

- チケット 01（DB スキーマ）完了済み
- チケット 04（案件管理）完了済み
- チケット 05（タスク管理）完了済み

## 実装内容

### 削除ログの記録方式

Server Action 内で以下の順序で処理する：

```typescript
// 1. 削除対象レコードを取得
const record = await db.select().from(projects).where(eq(projects.projectId, id)).limit(1);

// 2. deletion_logs に記録
await db.insert(deletionLogs).values({
  tableName: 'projects',
  recordId: id,
  deletedData: record[0],
  deletedBy: await getUserStaffId(),  // ログインユーザーの staffId
});

// 3. 物理削除（CASCADE により tasks も削除される）
await db.delete(projects).where(eq(projects.projectId, id));
```

タスク削除時も同様のパターンで処理する（tableName: 'tasks'）。

### 削除ログ閲覧画面

管理者専用。一覧表示のみ（編集・削除は不要）。

**ルート**: `/admin/deletion-logs`

```
app/(private)/admin/
  deletion-logs/
    page.tsx
```

**表示項目**:
| カラム | 内容 |
|---|---|
| 削除日時 | deletedAt |
| テーブル | tableName（案件 / タスク） |
| 削除されたレコード名 | deletedData 内の name フィールド |
| 操作者 | deletedBy に対応するユーザー名 |
| 詳細 | deletedData の JSON を展開表示（折りたたみ） |

- ページネーション付き（20件/ページ）
- ソート：削除日時降順（固定）
- 管理者権限チェック（一般ユーザーはアクセス不可）

### features 構成

```
features/deletion-log/
  list/
    deletion-log-list-page.tsx         ← 一覧ページ（Server Component）
    deletion-log-list.tsx              ← テーブル表示
    deletion-log-detail.client.tsx     ← JSON 展開表示（Client Component）
```

### 共通ユーティリティ

案件・タスクの削除 Server Action で重複コードが生まれないよう、
削除ログ記録の処理を共通関数としてまとめる。

```typescript
// features/deletion-log/record-deletion.ts
export async function recordDeletion(
  tableName: 'projects' | 'tasks',
  recordId: string,
  deletedData: Record<string, unknown>,
) {
  const staffId = await getUserStaffId();
  await db.insert(deletionLogs).values({
    tableName,
    recordId,
    deletedData,
    deletedBy: staffId,
  });
}
```

## 完了条件

- [ ] 案件を削除すると `deletion_logs` にレコードが記録される
- [ ] タスクを削除すると `deletion_logs` にレコードが記録される
- [ ] `deletedBy`（操作者）が正しく記録される
- [ ] `deletedData` に削除前のレコード全体が JSON として保存される
- [ ] `/admin/deletion-logs` で削除ログ一覧が表示される（管理者のみ）
- [ ] 一般ユーザーが削除ログ画面にアクセスすると 403 またはリダイレクトされる
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
