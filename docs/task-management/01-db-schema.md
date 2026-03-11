# チケット 01: DB スキーマ変更・マイグレーション

## 概要

既存の顧客 CRM 向けテーブルを削除し、タスク・案件管理システム向けの新テーブルを作成する。
Drizzle ORM のマイグレーションファイルとして管理する。

## 背景

既存テーブルは CRM 固有の設計（customers・customer_notes・customer_memories 等）であり、
そのまま流用できないため、スキーマを新規設計して置き換える。
`staffs` テーブルはユーザー管理の基盤として **そのまま流用** する。

## 現状のテーブル構成

```
[流用] staffs              ← Supabase auth.users と紐づくユーザーテーブル
[削除] customers
[削除] customer_notes
[削除] customer_note_images
[削除] customer_memories
[削除] customer_note_advice
```

## 新スキーマ設計

### projects（案件）テーブル

```
projectId     UUID          PK, default: gen_random_uuid()
name          text          NOT NULL  案件名
description   text                    詳細説明（任意）
assigneeId    UUID          FK → staffs(staffId)  担当者
status        text          NOT NULL  'todo' | 'in_progress' | 'done'
dueDate       date                    期限
createdAt     timestamp     NOT NULL, default: now()
updatedAt     timestamp     NOT NULL, default: now()

インデックス:
  - assigneeId（担当者絞り込み）
  - status（ステータス絞り込み）
  - dueDate（期限ソート）
  - name（キーワード検索用）

RLS: 有効
```

### tasks（タスク）テーブル

```
taskId        UUID          PK, default: gen_random_uuid()
projectId     UUID          FK → projects(projectId) ON DELETE CASCADE
name          text          NOT NULL  タスク名
description   text                    詳細説明（任意）
assigneeId    UUID          FK → staffs(staffId)  担当者
status        text          NOT NULL  'todo' | 'in_progress' | 'done'
dueDate       date                    期限
createdAt     timestamp     NOT NULL, default: now()
updatedAt     timestamp     NOT NULL, default: now()

インデックス:
  - projectId + createdAt.desc()（案件詳細画面のタスク一覧）
  - assigneeId（担当者絞り込み）
  - status（ステータス絞り込み）

RLS: 有効
```

### deletion_logs（削除ログ）テーブル

```
id            UUID          PK, default: gen_random_uuid()
tableNameText text          NOT NULL  削除対象テーブル名（'projects' | 'tasks'）
recordId      UUID          NOT NULL  削除されたレコードの ID
deletedData   jsonb         NOT NULL  削除時点のレコード内容（全カラム）
deletedBy     UUID                    操作者の staffId（アプリ側でセット）
deletedAt     timestamp     NOT NULL, default: now()

インデックス:
  - tableNameText + deletedAt.desc()（管理画面の一覧表示）
  - deletedBy（操作者絞り込み）

RLS: 有効（管理者のみ参照可）
```

## ER 図（テキスト）

```
staffs
  └─< projects (assigneeId → staffs.staffId)
        └─< tasks (projectId → projects.projectId, assigneeId → staffs.staffId)

deletion_logs  ← DBトリガーが自動INSERT
```

## 実装手順

1. `packages/db/src/schema/` に以下のファイルを作成
   - `projects.ts`
   - `tasks.ts`
   - `deletion-logs.ts`
2. 既存の削除対象スキーマファイルを削除
   - `customers.ts`、`customer-notes.ts`、`customer-memories.ts`、
     `customer-note-images.ts`、`customer-note-advice.ts`
3. `packages/db/src/schema/index.ts` の export を更新
4. `pnpm -w db:generate` でマイグレーションファイルを生成
5. `pnpm -w db:migrate` でローカル DB に適用
6. `pnpm -w db:reset` で動作確認（シードデータも更新する）

## シードデータ

`supabase/seed.sql` に以下を追加：

- テスト用ユーザー（admin 1名・一般ユーザー 2名）は既存のものを流用
- テスト用案件 3〜5件
- 各案件に 2〜3件のタスク

## 補足

- `staffs` テーブルのカラム構成（staffId、authUserId、firstName、lastName 等）は変更しない
- ステータス値は DB レベルでは text 型とし、アプリ側で型安全に扱う
- `deletedBy` の記録は、アプリ側で削除直前に `deletion_logs` に INSERT し、その直後に物理削除する方式を採用する（PostgreSQL セッション変数方式は使用しない）

## 完了条件

- [ ] 新スキーマファイルが作成されている
- [ ] 旧スキーマファイルが削除されている
- [ ] マイグレーションファイルが生成されている
- [ ] `pnpm -w db:reset` が正常に完了する
- [ ] `pnpm -w validate:check` が通る
