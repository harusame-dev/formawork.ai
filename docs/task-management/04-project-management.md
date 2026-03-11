# チケット 04: 案件管理機能（CRUD）

## 概要

案件（project）の登録・一覧・詳細・編集・削除機能を実装する。
既存の顧客管理（`features/customer/`）の CRUD 構造を参考に、案件管理として新規実装する。

## 背景

本システムの中核機能。顧客管理と同様の 1:N 構造（案件 : タスク）を持ち、
既存 CRUD の実装パターンをテンプレートとして活用することで効率的に実装できる。

## 前提チケット

- チケット 00（不要機能削除）完了済み
- チケット 01（DB スキーマ）完了済み

## 実装内容

### ルート構成

```
app/(private)/projects/                   ← 案件一覧
app/(private)/projects/new/               ← 案件新規登録
app/(private)/projects/[projectId]/       ← 案件詳細（タスク一覧を含む）
app/(private)/projects/[projectId]/edit/  ← 案件編集
```

### features 構成

```
features/project/
  list/
    project-list-page.tsx            ← 一覧ページコンポーネント（Server Component）
    project-list.tsx                 ← テーブル/カード一覧表示
    project-list-search.client.tsx   ← 検索・絞り込み UI（チケット 06 と連携）
  detail/
    project-detail-page.tsx          ← 詳細ページコンポーネント（Server Component）
    project-detail.tsx               ← 詳細情報表示
  register/
    project-register-page.tsx        ← 登録ページ
    project-register-form.client.tsx ← 登録フォーム（react-hook-form）
    project-register.action.ts       ← Server Action
  edit/
    project-edit-page.tsx            ← 編集ページ
    project-edit-form.client.tsx     ← 編集フォーム（react-hook-form）
    project-edit.action.ts           ← Server Action
  delete/
    project-delete.action.ts         ← Server Action（削除ログ記録 → 物理削除）
    project-delete-button.client.tsx ← 削除確認ダイアログ付きボタン
  schema.ts                          ← Valibot スキーマ（登録・編集共通）
  tag.ts                             ← キャッシュタグ定義
```

### 案件の入力項目

| フィールド | 型 | 必須 | バリデーション |
|---|---|---|---|
| 案件名（name） | text | 必須 | 最大 100 文字 |
| 詳細説明（description） | textarea | 任意 | 最大 1000 文字 |
| 担当者（assigneeId） | select | 必須 | staffs から選択 |
| ステータス（status） | select | 必須 | todo / in_progress / done |
| 期限（dueDate） | date | 任意 | 今日以降 |

### ステータス表示ラベル

| 値 | 表示ラベル | バッジ色 |
|---|---|---|
| `todo` | 未着手 | グレー |
| `in_progress` | 進行中 | ブルー |
| `done` | 完了 | グリーン |

### 案件一覧

- ページネーション付き（20件/ページ）
- ソート：作成日時降順（デフォルト）
- 表示項目：案件名・担当者・ステータス・期限・登録日
- 検索・絞り込みは **チケット 06** で実装（本チケットではプレーンな一覧のみ）

### 案件詳細

- 案件の詳細情報を表示
- ひもづくタスク一覧を表示（**チケット 05** で実装）
- 編集・削除ボタンを配置

### 削除処理

チケット 08（削除ログ）と連携。削除時は以下の順序で処理する：

1. `deletion_logs` テーブルに削除対象レコードを記録
2. `projects` テーブルから物理削除（CASCADE により tasks も自動削除）
3. `revalidateTag` でキャッシュ無効化

## 参考実装

- `features/customer/` の構造・命名規則・実装パターンをそのまま踏襲する
- 特に以下のファイルが参考になる：
  - `features/customer/register/customer-register.action.ts`
  - `features/customer/list/customer-list-page.tsx`
  - `features/customer/schema.ts`

## 完了条件

- [ ] 案件一覧（`/projects`）にアクセスできる
- [ ] 案件を新規登録できる（バリデーションが機能する）
- [ ] 案件詳細（`/projects/[projectId]`）を表示できる
- [ ] 案件を編集できる
- [ ] 案件を削除できる（確認ダイアログ付き）
- [ ] 削除後にキャッシュが正しく無効化される
- [ ] ページネーションが動作する
- [ ] バリデーションエラーが画面に表示される
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
