# チケット 11: タスク詳細ページ

## 概要

タスク一覧のタスク名をリンク化し、タスク詳細ページ（`/projects/[projectId]/tasks/[taskId]`）を新規作成する。
詳細ページではタスクの全情報を表示し、編集・削除・ステータス変更の操作も可能にする。
コメントセクションは本チケットではプレースホルダーとして配置し、実装はチケット 12 で行う。

## 背景

現在のタスク一覧ではタスク名・ステータス・担当者・期限のみ表示されており、
`description`（詳細説明）を確認・入力する手段がない。
詳細ページを設けることで、タスクの完全な情報へのアクセスとコメント機能（チケット 12）の起点を提供する。

## 前提チケット

- チケット 05（タスク管理）完了済み

## 実装内容

### ルート構成

```
app/(private)/projects/[projectId]/tasks/[taskId]/   ← タスク詳細ページ（新規）
```

### 一覧からのリンク追加

`features/task/list/tasks.universal.tsx` のタスク名セルを `Link` コンポーネントに変更する。

```tsx
// Before
<TableCell>{task.name}</TableCell>

// After
<TableCell>
  <Link href={`/projects/${task.projectId}/tasks/${task.taskId}`}>
    {task.name}
  </Link>
</TableCell>
```

### features 構成

```
features/task/
  detail/
    task-detail.server.tsx           ← データ取得 Server Component
    task-detail.universal.tsx        ← 詳細表示 Presenter
    task-detail-skeleton.universal.tsx ← ローディングスケルトン
    get-task-detail.ts               ← DB クエリ関数
```

### タスク詳細ページの表示項目

| 項目 | 表示方法 |
|---|---|
| タスク名（name） | ページタイトル（h1） |
| ステータス（status） | `TaskStatusSelect`（既存）を流用してワンクリック変更可能に |
| 担当者（assigneeName） | テキスト表示 |
| 期限（dueDate） | テキスト表示 |
| 詳細説明（description） | テキストエリア風表示（空の場合は「説明なし」） |
| コメントセクション | プレースホルダー（「コメント機能は準備中です」等）|

### ページレイアウト

```
/projects/[projectId]/tasks/[taskId]
┌───────────────────────────────────────┐
│ ← 案件詳細に戻る                       │
│                                       │
│  [タスク名]                            │
│                                       │
│  ステータス: [ステータスセレクト]        │
│  担当者:    ○○ ○○                     │
│  期限:      2025-12-31                 │
│                                       │
│  詳細説明                              │
│  ─────────────────────────────────    │
│  （説明テキスト）                       │
│                                       │
│  [編集] [削除]                         │
├───────────────────────────────────────┤
│  コメント                              │
│  （チケット 12 で実装）                 │
└───────────────────────────────────────┘
```

### get-task-detail.ts

```ts
type TaskDetail = {
  taskId: string;
  projectId: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
```

### キャッシュ

既存の `TaskTag` を流用する。`get-task-detail.ts` では `unstable_cache` に `TaskTag.Detail(taskId)` を設定する。

## 参考実装

- `features/project/detail/` - 案件詳細ページの構造を踏襲する
- `features/task/status/task-status-select.client.tsx` - ステータスセレクト（そのまま流用）
- `features/task/delete/delete-task-dialog.client.tsx` - 削除確認ダイアログ（そのまま流用）
- `features/task/edit/edit-task-dialog.client.tsx` - 編集ダイアログ（そのまま流用）

## テスト

### ブラウザテスト（small）

`features/task/detail/task-detail.small.browser.test.tsx`

- タスク詳細が正しくレンダリングされる
- `description` が null の場合「説明なし」と表示される

## 完了条件

- [ ] タスク一覧のタスク名がリンクになっている
- [ ] `/projects/[projectId]/tasks/[taskId]` にアクセスするとタスク詳細が表示される
- [ ] description を含む全フィールドが表示される
- [ ] ステータスをワンクリックで変更できる
- [ ] 編集・削除が詳細ページから操作できる
- [ ] 案件詳細への戻るリンクがある
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
- [ ] テストが通る
