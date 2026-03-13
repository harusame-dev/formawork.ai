# チケット15: タスクコメント日付表示

## 概要

タスクコメント一覧に投稿日時・編集済みマーク・更新日時を表示する。

## 背景

チケット12でタスクコメント機能を実装した際、`createdAt`・`updatedAt` はDBスキーマ・クエリ両方に存在しているにもかかわらず、表示コンポーネントで日付を表示していなかった。ユーザーがコメントの投稿タイミングや編集有無を確認できるよう追加する。

## 受け入れ条件

- コメント一覧で各コメントの投稿日時が表示される
- 編集されたコメントには「編集済み」マークと更新日時が表示される
- 未編集コメントには「編集済み」マークが表示されない

## 実装対象

- `apps/web/features/task-comment/list/task-comments.universal.tsx`
- `apps/web/features/task-comment/list/task-comments.small.browser.test.tsx`
