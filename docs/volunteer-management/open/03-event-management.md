# チケット 03: イベント管理（作成・編集・削除・一覧）

## 概要

ボランティア来場管理の基盤となるイベントの CRUD 機能を実装する。
イベント一覧・作成・編集・削除の各画面とサーバーアクションを実装する。

## 背景

すべての管理機能はイベント単位で動作するため、イベント管理は最初に実装する必要がある。
イベントには複数の開催日を設定でき、ボランティアの参加日選択の基準となる。

## 実装対象

### 画面

| URL | 内容 |
|---|---|
| `/events` | イベント一覧 |
| `/events/new` | イベント作成 |
| `/events/[eventId]/edit` | イベント編集 |
| `/events/[eventId]` | イベント詳細（来場状況一覧＋各種管理へのリンク） |

### イベントフォーム項目

| フィールド | 型 | バリデーション |
|---|---|---|
| イベント名 | text | 必須、最大 100 文字 |
| 開催日 | date[] | 必須、1件以上、重複不可 |
| 詳細説明 | text | 任意 |

### イベント一覧の表示項目

- イベント名
- 開催日（例：2024/01/11〜2024/01/13）
- ボランティア登録数
- 作成日時
- 詳細へのリンク

### イベント詳細画面の構成

イベント詳細（`/events/[eventId]`）は来場状況一覧を中心に置き、
以下のナビゲーションリンクを提供する：

- 来場状況一覧（デフォルト表示、チケット 06 で実装）
- ボランティア管理 → `/events/[eventId]/volunteers`
- CSV取り込み → `/events/[eventId]/csv-import`
- 来場ページURL管理 → `/events/[eventId]/attendance-url`
- イベント編集 → `/events/[eventId]/edit`
- イベント削除

### 削除仕様

- イベント削除時は確認ダイアログを表示する
- `ON DELETE CASCADE` により紐づくボランティア・来場記録・URLトークンも自動削除される

## features モジュール構成

```
apps/web/features/event/
  components/
    event-form.tsx        # 作成・編集共用フォーム
    event-list.tsx        # イベント一覧コンポーネント
    event-list-item.tsx   # 一覧の各行
    event-detail-nav.tsx  # イベント詳細のナビゲーション
  actions/
    create-event.ts
    update-event.ts
    delete-event.ts
  queries/
    get-events.ts
    get-event.ts
```

## 実装手順

1. `features/event/` モジュールを作成
2. `get-events.ts`・`get-event.ts` クエリを実装
3. `create-event.ts`・`update-event.ts`・`delete-event.ts` サーバーアクションを実装
4. `event-form.tsx` コンポーネントを実装（作成・編集で共用）
   - 複数日選択 UI（日付追加・削除ボタン）
5. 各ページコンポーネントを実装
6. `pnpm -w validate:check` でエラーがないことを確認
7. `pnpm -w build` が通ることを確認
8. ブラウザで動作確認（作成・編集・削除・一覧表示）

## 完了条件

- [ ] イベント一覧が表示される
- [ ] イベントを作成できる（複数開催日の設定含む）
- [ ] イベントを編集できる
- [ ] イベントを削除できる（確認ダイアログあり）
- [ ] バリデーションエラーが適切に表示される
- [ ] `pnpm -w validate:check` が通る
- [ ] `pnpm -w build` が通る
- [ ] ブラウザでの動作確認が完了している（スクリーンショットで画面崩れがないこと）
- [ ] ブラウザコンソール・開発サーバーにエラーログがないこと
