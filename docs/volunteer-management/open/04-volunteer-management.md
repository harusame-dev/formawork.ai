# チケット 04: ボランティア管理（登録・編集・削除・一覧）

## 概要

イベントに紐づくボランティアの CRUD 機能を実装する。
ボランティア一覧・登録・編集・削除の各画面とサーバーアクションを実装する。

## 背景

ボランティアはイベント単位で管理する（イベント間での共有なし）。
6桁数字コードはイベント内で一意であり、来場画面での本人照合に使用される。

## 実装対象

### 画面

| URL | 内容 |
|---|---|
| `/events/[eventId]/volunteers` | ボランティア一覧 |
| `/events/[eventId]/volunteers/new` | ボランティア登録 |
| `/events/[eventId]/volunteers/[volunteerId]/edit` | ボランティア編集 |

### ボランティアフォーム項目

| フィールド | 型 | バリデーション |
|---|---|---|
| 氏名 | text | 必須、最大 100 文字 |
| ID（コード） | char(6) | 必須、数字6桁、イベント内一意 |
| 性別 | text | 任意（「男性」「女性」「その他」「未回答」等） |
| 参加予定日 | date[] | 必須、1件以上、イベント開催日の中から選択 |

### ボランティア一覧の表示項目

- 氏名
- ID（コード）
- 性別
- 参加予定日
- 詳細へのリンク
- 編集・削除ボタン

### 削除仕様

- ボランティア削除時は確認ダイアログを表示する
- `ON DELETE CASCADE` により紐づく来場記録も自動削除される

## features モジュール構成

```
apps/web/features/volunteer/
  components/
    volunteer-form.tsx         # 登録・編集共用フォーム
    volunteer-list.tsx         # ボランティア一覧コンポーネント
    volunteer-list-item.tsx    # 一覧の各行
  actions/
    create-volunteer.ts
    update-volunteer.ts
    delete-volunteer.ts
  queries/
    get-volunteers.ts
    get-volunteer.ts
```

## 実装手順

1. `features/volunteer/` モジュールを作成
2. `get-volunteers.ts`・`get-volunteer.ts` クエリを実装
3. `create-volunteer.ts`・`update-volunteer.ts`・`delete-volunteer.ts` サーバーアクションを実装
4. `volunteer-form.tsx` コンポーネントを実装
   - 参加予定日はイベントの開催日一覧からチェックボックスで選択
   - ID重複エラーをサーバーアクションから受け取り表示
5. 各ページコンポーネントを実装
6. `pnpm -w validate:check` でエラーがないことを確認
7. `pnpm -w build` が通ることを確認
8. ブラウザで動作確認（登録・編集・削除・一覧表示）

## 完了条件

- [ ] ボランティア一覧が表示される
- [ ] ボランティアを登録できる
- [ ] ボランティアを編集できる
- [ ] ボランティアを削除できる（確認ダイアログあり）
- [ ] IDが重複した場合にエラーが表示される
- [ ] 参加予定日がイベント開催日から選択できる
- [ ] バリデーションエラーが適切に表示される
- [ ] `pnpm -w validate:check` が通る
- [ ] `pnpm -w build` が通る
- [ ] ブラウザでの動作確認が完了している（スクリーンショットで画面崩れがないこと）
- [ ] ブラウザコンソール・開発サーバーにエラーログがないこと
