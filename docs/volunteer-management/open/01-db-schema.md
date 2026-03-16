# チケット 01: DB スキーマ設計・マイグレーション

## 概要

既存のタスク管理システム向けテーブルを削除し、ボランティア来場管理システム向けの新テーブルを作成する。
Drizzle ORM のマイグレーションファイルとして管理する。

## 背景

既存テーブルは案件・タスク管理固有の設計（projects・tasks・deletion_logs 等）であり、
そのまま流用できないため、スキーマを新規設計して置き換える。
`staffs` テーブルはユーザー管理の基盤として **そのまま流用** する。

## 現状のテーブル構成

```
[流用] staffs              ← Supabase auth.users と紐づくユーザーテーブル
[削除] projects
[削除] tasks
[削除] deletion_logs
[削除] task_assignees（存在する場合）
```

## 新スキーマ設計

### events（イベント）テーブル

```
eventId       UUID          PK, default: gen_random_uuid()
name          text          NOT NULL  イベント名
eventDates    date[]        NOT NULL  イベント開催日（複数日対応）
description   text                    詳細説明（任意）
createdAt     timestamptz   NOT NULL, default: now()
updatedAt     timestamptz   NOT NULL, default: now()

RLS: 有効
```

### volunteers（ボランティア）テーブル

```
volunteerId        UUID          PK, default: gen_random_uuid()
eventId            UUID          FK → events(eventId) ON DELETE CASCADE
name               text          NOT NULL  氏名
code               char(6)       NOT NULL  6桁数字ID（イベント内で一意）
gender             text                    性別（任意）
participationDates date[]        NOT NULL  参加予定日（イベント日の中から選択）
createdAt          timestamptz   NOT NULL, default: now()
updatedAt          timestamptz   NOT NULL, default: now()

UNIQUE(eventId, code)

インデックス:
  - eventId（イベント絞り込み）
  - (eventId, code)（一意制約と検索）

RLS: 有効
```

### attendance_records（来場記録）テーブル

```
attendanceRecordId UUID          PK, default: gen_random_uuid()
volunteerId        UUID          FK → volunteers(volunteerId) ON DELETE CASCADE
recordedAt         timestamptz   NOT NULL, default: now()

インデックス:
  - volunteerId + recordedAt.desc()（ボランティア詳細画面の来場履歴）

RLS: 有効
```

### event_attendance_urls（来場ページURL用トークン）テーブル

```
eventAttendanceUrlId UUID         PK, default: gen_random_uuid()
eventId              UUID         FK → events(eventId) ON DELETE CASCADE, UNIQUE
token                text         NOT NULL UNIQUE  ランダムトークン
createdAt            timestamptz  NOT NULL, default: now()

インデックス:
  - token（来場ページアクセス時の高速検索）

RLS: 有効（来場ページからの参照はトークン一致で許可）
```

## ER 図（テキスト）

```
staffs（流用）

events
  └─< volunteers (eventId → events.eventId)
        └─< attendance_records (volunteerId → volunteers.volunteerId)

events
  └── event_attendance_urls (eventId → events.eventId, UNIQUE)
```

## 実装手順

1. `packages/db/src/schema/` に以下のファイルを作成
   - `events.ts`
   - `volunteers.ts`
   - `attendance-records.ts`
   - `event-attendance-urls.ts`
2. 既存の削除対象スキーマファイルを削除
   - `projects.ts`、`tasks.ts`、`deletion-logs.ts` 等
3. `packages/db/src/schema/index.ts` の export を更新
4. `pnpm -w db:generate` でマイグレーションファイルを生成
5. `pnpm -w db:migrate` でローカル DB に適用
6. `supabase/seed.sql` を更新（後述）
7. `pnpm -w db:reset` で動作確認

## シードデータ

`supabase/seed.sql` に以下を追加：

- テスト用ユーザー（admin 1名）は既存のものを流用
- テスト用イベント 2件
  - イベント1: 3日間開催（開催日 3件）
  - イベント2: 1日開催
- 各イベントにボランティア 5〜10名
- 一部のボランティアに来場記録を追加
- 各イベントに来場ページURL用トークンを追加

## 補足

- `code` カラムは char(6) とし、0埋め6桁数字を想定（アプリ側でバリデーション）
- RLS ポリシーは管理者（staffs テーブルに存在するユーザー）のみ操作可能とする
- `event_attendance_urls` の token 経由アクセスは RLS で個別に許可する

## 完了条件

- [ ] 新スキーマファイルが作成されている
- [ ] 旧スキーマファイルが削除されている
- [ ] マイグレーションファイルが生成されている
- [ ] `pnpm -w db:reset` が正常に完了する
- [ ] `pnpm -w validate:check` が通る
- [ ] `pnpm -w build` が通る
