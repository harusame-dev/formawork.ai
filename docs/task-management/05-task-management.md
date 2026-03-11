# チケット 05: タスク管理機能（CRUD・ステータス管理）

## 概要

案件（project）にひもづくタスクの登録・編集・削除およびステータス管理機能を実装する。
案件詳細画面内にタスク一覧を組み込む。

## 背景

1 案件 : N タスクの構造は、既存の顧客管理 : 顧客ノート（1:N）と同じ設計パターン。
`features/customer-note/` の実装構造を参考にしながら、
ステータス管理という新規要件を追加して実装する。

## 前提チケット

- チケット 01（DB スキーマ）完了済み
- チケット 04（案件管理）完了済み

## 実装内容

### ルート構成

タスクは案件詳細画面に組み込む。タスク単独のページは設けない。

```
app/(private)/projects/[projectId]/   ← タスク一覧を案件詳細内に表示
```

### features 構成

```
features/task/
  list/
    task-list.tsx                    ← タスク一覧コンポーネント（案件詳細内で使用）
  register/
    task-register-form.client.tsx    ← 登録フォーム（モーダルまたはインライン）
    task-register.action.ts          ← Server Action
  edit/
    task-edit-form.client.tsx        ← 編集フォーム（モーダルまたはインライン）
    task-edit.action.ts              ← Server Action
  delete/
    task-delete.action.ts            ← Server Action（削除ログ記録 → 物理削除）
    task-delete-button.client.tsx    ← 削除確認ダイアログ付きボタン
  status/
    task-status-update.action.ts     ← ステータス更新専用 Server Action
    task-status-badge.tsx            ← ステータスバッジ表示コンポーネント
  schema.ts                          ← Valibot スキーマ
  tag.ts                             ← キャッシュタグ定義
```

### タスクの入力項目

| フィールド | 型 | 必須 | バリデーション |
|---|---|---|---|
| タスク名（name） | text | 必須 | 最大 100 文字 |
| 詳細説明（description） | textarea | 任意 | 最大 1000 文字 |
| 担当者（assigneeId） | select | 必須 | staffs から選択 |
| ステータス（status） | select | 必須 | todo / in_progress / done |
| 期限（dueDate） | date | 任意 | 案件期限以前（案件に期限がある場合） |

### ステータス管理

| 値 | 表示ラベル | バッジ色 |
|---|---|---|
| `todo` | 未着手 | グレー |
| `in_progress` | 進行中 | ブルー |
| `done` | 完了 | グリーン |

ステータスはフォーム編集のほか、**ワンクリック更新**（ドロップダウンまたはボタン切り替え）にも対応する。
UI は既存の `packages/ui/src/components/select.tsx` を活用する。

### 案件詳細内のタスク表示

- タスク一覧は案件詳細画面（`/projects/[projectId]`）内のセクションとして表示
- 新規タスク追加ボタンをタスク一覧の上部または下部に配置
- 各タスク行から編集・削除が可能
- タスク数が多い場合のソート：作成日時降順（デフォルト）

### 削除処理

チケット 08（削除ログ）と連携。削除時は以下の順序で処理する：

1. `deletion_logs` テーブルに削除対象レコードを記録
2. `tasks` テーブルから物理削除
3. `revalidateTag` でキャッシュ無効化

### バリデーション

- タスク期限 > 案件期限 の場合は警告（エラーにしてもよい）
- 必須項目の未入力チェック

## 参考実装

- `features/customer-note/` の登録・編集・削除の Server Action パターンを踏襲する
- 特に以下のファイルが参考になる：
  - `features/customer-note/register/customer-note-register.action.ts`
  - `features/customer-note/edit/customer-note-edit.action.ts`

## 完了条件

- [ ] 案件詳細画面内にタスク一覧が表示される
- [ ] タスクを新規登録できる（バリデーションが機能する）
- [ ] タスクを編集できる
- [ ] タスクを削除できる（確認ダイアログ付き）
- [ ] ステータスをワンクリックで更新できる
- [ ] 削除後にキャッシュが正しく無効化される
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
