# チケット17: タスク詳細画面にプロジェクト情報をカード内に表示する

## 背景

現在、タスク詳細画面（`/projects/[projectId]/tasks/[taskId]`）では、ページのヘッダー部分にプロジェクト名が表示されているが、タスク詳細情報のカード（ステータス・担当者・期限・詳細説明を含む）にはプロジェクト情報が表示されていない。タスクを見るだけでどのプロジェクトに属するかが一目でわかるよう、カード内にプロジェクト情報を埋め込みたい。

## 受け入れ条件

- タスク詳細カード内に「プロジェクト」フィールドが表示される
- プロジェクトフィールドにはプロジェクト名が表示される

## 実装対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `apps/web/features/task/detail/get-task-detail.ts` | DB クエリに projects テーブルの JOIN を追加し、`projectName` を取得。`TaskDetail` 型に `projectName: string` を追加 |
| `apps/web/features/task/detail/task-detail.universal.tsx` | `TaskDetailPresenter` に `projectName` フィールドを追加し、担当者の上に「プロジェクト」行を表示 |
| `apps/web/features/task/detail/task-detail.server.tsx` | `getTaskDetail` から取得した `projectName` を `TaskDetailPresenter` に渡す |
| `apps/web/features/task/detail/task-detail-skeleton.universal.tsx` | スケルトン UI にプロジェクト行を追加 |
