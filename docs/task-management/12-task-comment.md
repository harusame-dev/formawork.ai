# チケット 12: タスクコメント機能

## 概要

タスク詳細ページにコメント機能を追加する。
DB スキーマへの `task_comments` テーブル追加から、コメントの閲覧・投稿・編集・削除までを実装する。
編集・削除は「投稿者本人または管理者」のみ実行できる。

## 背景

タスクに関するやり取りや進捗メモをシステム上で管理できるようにする。
チケット 11（タスク詳細ページ）で設けたコメントセクションのプレースホルダーを実装に置き換える。

## 前提チケット

- チケット 11（タスク詳細ページ）完了済み

## 実装内容

### DB スキーマ追加

`packages/db/src/schema/task-comments.ts` を新規作成する。

```
task_comments テーブル

commentId   UUID      PK, default: gen_random_uuid()
taskId      UUID      FK → tasks(taskId) ON DELETE CASCADE  NOT NULL
authorId    UUID      FK → staffs(staffId)                  NOT NULL
content     text      NOT NULL  コメント本文（最大 1000 文字）
createdAt   timestamp NOT NULL, default: now()
updatedAt   timestamp NOT NULL, default: now()

インデックス:
  - taskId + createdAt.asc()（タスク詳細のコメント一覧）

RLS: 有効
```

マイグレーション手順：
1. `packages/db/src/schema/task-comments.ts` を作成
2. `packages/db/src/schema/index.ts` に export を追加
3. `pnpm -w db:generate` でマイグレーションファイル生成
4. `pnpm -w db:migrate` で適用

### features 構成

```
features/task-comment/
  list/
    task-comments.server.tsx             ← データ取得 Server Component
    task-comments.universal.tsx          ← コメント一覧 Presenter
    get-task-comments.ts                 ← DB クエリ関数
  post/
    post-task-comment-form.client.tsx    ← 投稿フォーム
    post-task-comment.action.ts          ← Server Action
    post-task-comment.ts                 ← DB 書き込みロジック
    schema.ts                            ← Valibot スキーマ
  edit/
    edit-task-comment-dialog.client.tsx  ← 編集ダイアログ
    edit-task-comment.action.ts          ← Server Action
    edit-task-comment.ts                 ← DB 書き込みロジック
    schema.ts                            ← Valibot スキーマ
  delete/
    delete-task-comment-dialog.client.tsx ← 削除確認ダイアログ
    delete-task-comment.action.ts         ← Server Action
    delete-task-comment.ts                ← DB 書き込みロジック
  tag.ts                                  ← キャッシュタグ定義
```

### コメントの入力項目

| フィールド | 型 | 必須 | バリデーション |
|---|---|---|---|
| 本文（content） | textarea | 必須 | 最大 1000 文字 |

### コメント一覧の表示項目

| 項目 | 表示方法 |
|---|---|
| 投稿者名（authorName） | テキスト |
| 投稿日時（createdAt） | 相対表示（例：3時間前）または絶対日時 |
| 本文（content） | テキスト（改行を保持） |
| 編集ボタン | 投稿者本人または管理者のみ表示 |
| 削除ボタン | 投稿者本人または管理者のみ表示 |

### 権限制御

| 操作 | 権限 |
|---|---|
| コメント閲覧 | 全ユーザー |
| コメント投稿 | 全ユーザー |
| コメント編集 | 投稿者本人 または 管理者 |
| コメント削除 | 投稿者本人 または 管理者 |

Server Action 内で `getCurrentUser()` から取得したユーザーの `staffId` と `role` を使い、
「`authorId === currentUser.staffId` または `role === 'admin'`」を検証して権限チェックを行う。

### キャッシュタグ

```ts
// features/task-comment/tag.ts
export const TaskCommentTag = {
  List: (taskId: string) => `task-comment-list-${taskId}`,
};
```

コメントの追加・編集・削除後は `revalidateTag(TaskCommentTag.List(taskId))` でキャッシュを無効化する。

### タスク詳細ページへの組み込み

チケット 11 で配置したコメントセクションのプレースホルダーを以下に置き換える。

```tsx
// app/(private)/projects/[projectId]/tasks/[taskId]/page.tsx
<Suspense fallback={<div className="sr-only">読み込み中</div>}>
  <TaskCommentsContainer taskId={taskId} />
</Suspense>
<PostTaskCommentFormContainer taskId={taskId} />
```

## 参考実装

- `features/task/register/` - Server Action・フォームのパターンを踏襲する
- `features/task/delete/delete-task-dialog.client.tsx` - 削除確認ダイアログのパターン
- `features/task/edit/edit-task-dialog.client.tsx` - 編集ダイアログのパターン

## テスト

### サーバーテスト（medium）

`features/task-comment/post/post-task-comment.medium.server.test.ts`

- コメントを投稿できる
- 存在しないタスクIDを指定するとエラーを返す

`features/task-comment/delete/delete-task-comment.medium.server.test.ts`

- 投稿者本人がコメントを削除できる
- 管理者が他人のコメントを削除できる
- 権限のないユーザーが削除しようとするとエラーを返す

### Server Action テスト（small）

`features/task-comment/post/post-task-comment-action.small.server.test.ts`

- 未認証ユーザーがアクセスするとエラーになる
- スキーマバリデーションが機能する（空文字・1000文字超）

`features/task-comment/delete/delete-task-comment-action.small.server.test.ts`

- 権限のないユーザーがアクセスするとエラーになる

### ブラウザテスト（small）

`features/task-comment/list/task-comments.small.browser.test.tsx`

- コメント一覧が正しくレンダリングされる
- 自分のコメントには編集・削除ボタンが表示される
- 他人のコメントには編集・削除ボタンが表示されない

## E2E テスト

`e2e/task-comment.e2e.test.ts`

- タスク詳細ページでコメントを投稿できる
- 自分が投稿したコメントを編集できる
- 自分が投稿したコメントを削除できる
- 管理者が他人のコメントを削除できる

## 完了条件

- [ ] `task_comments` テーブルが作成されマイグレーションが通る
- [ ] タスク詳細ページにコメント一覧が表示される
- [ ] コメントを投稿できる（バリデーションが機能する）
- [ ] 投稿者本人が自分のコメントを編集できる
- [ ] 投稿者本人が自分のコメントを削除できる（確認ダイアログ付き）
- [ ] 管理者が全コメントを編集・削除できる
- [ ] 他人のコメントには編集・削除ボタンが表示されない
- [ ] コメント操作後にキャッシュが正しく無効化される
- [ ] `pnpm -w validate:check` と `pnpm -w build` が通る
- [ ] テストが通る
