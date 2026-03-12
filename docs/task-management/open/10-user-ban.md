# チケット 10: ユーザー無効化

## 概要

管理者がユーザーを無効化（ログイン禁止）・再有効化できる機能を追加する。
Supabase Admin API の `ban_duration` を使用してユーザーのアクセスを制御する。
無効化されたユーザーは一覧・詳細に「無効化済み」バッジで表示される。

## 背景

チケット03でユーザー管理機能（`/users`）への移行を完了した。
退職者や不正利用者のアカウントを即時無効化する手段がないため、追加が必要。
削除と異なり、無効化は可逆的な操作であるため、誤操作のリスクが低い。

## 現状

| 機能 | 実装状況 |
|---|---|
| ユーザー一覧・詳細表示 | 実装済み |
| ユーザー削除 | 実装済み |
| ユーザー無効化・再有効化 | **未実装** |
| 無効化済みバッジ表示 | **未実装** |

## 変更内容

### 1. `get-users.ts` の更新

`isBanned` フィールドを追加する。

```ts
const users = await db.select({
  // ... 既存フィールド
  isBanned: sql<boolean>`COALESCE("auth"."users".banned_until > now(), false)`,
})
```

### 2. `get-user-detail.ts` の更新

`isBanned` フィールドを追加する（`get-users.ts` と同様）。

### 3. 無効化ロジック（`features/user/toggle-ban/toggle-user-ban.ts`）

```ts
// 現在の状態を確認して toggle する
// 無効化: supabase.auth.admin.updateUserById(userId, { ban_duration: "876600h" })
// 再有効化: supabase.auth.admin.updateUserById(userId, { ban_duration: "none" })
```

- `ban_duration: "876600h"` で事実上永続的な無効化（100年）
- `ban_duration: "none"` で再有効化
- エラーハンドリング：対象ユーザーが存在しない場合はエラーを返す

### 4. Server Action（`features/user/toggle-ban/toggle-user-ban.action.ts`）

- `AdminRole` のみ実行可能
- `createServerAction` ラッパーを使用
- 成功後は `UserTag.Detail(userId)` と `UserTag.List` を再検証
- 成功後はリダイレクトなし（同ページに留まりキャッシュ更新）

### 5. ボタンコンポーネント（`features/user/toggle-ban/toggle-user-ban-button.client.tsx`）

- `"use client"` コンポーネント
- 現在の `isBanned` 状態に応じて「無効化」または「再有効化」ボタンを表示
- 確認ダイアログ（`AlertDialog`）を表示してから実行

### 6. ユーザーアクションスロットの更新（`app/(private)/users/[userId]/@action/page.tsx`）

- 管理者の場合のみ `ToggleUserBanButton` を表示
- 編集・削除ボタンと同じ行に配置

### 7. 一覧・詳細の「無効化済み」バッジ表示

- `UsersPresenter`（`features/user/list/users.universal.tsx`）: `isBanned` が true の場合、名前横に `Badge variant="destructive"` で「無効化済み」表示
- `UserBasicInfoPresenter`（`features/user/detail/user-basic-info.universal.tsx`）: 同様にバッジ表示

## ディレクトリ構成

```
features/user/toggle-ban/
├── toggle-user-ban.ts
├── toggle-user-ban.action.ts
└── toggle-user-ban-button.client.tsx
```

## テスト

### サーバーテスト（medium）

`features/user/toggle-ban/toggle-user-ban.medium.server.test.ts`

- 管理者がユーザーを無効化できる
- 管理者が無効化済みユーザーを再有効化できる
- 存在しないユーザーIDを指定するとエラーを返す

### Server Action テスト（small）

`features/user/toggle-ban/toggle-user-ban-action.small.server.test.ts`

- 管理者以外がアクセスするとエラーになる
- スキーマバリデーションが機能する

### ブラウザテスト（small）

`features/user/toggle-ban/toggle-user-ban-button.small.browser.test.tsx`

- `isBanned: false` の場合「無効化」ボタンが表示される
- `isBanned: true` の場合「再有効化」ボタンが表示される
- ボタンクリックで確認ダイアログが表示される

## E2E テスト

`e2e/user-ban.e2e.test.ts`

- 管理者がユーザーを無効化できる
- 無効化されたユーザーは一覧に「無効化済み」バッジで表示される
- 無効化されたユーザーがログインを試みると失敗する
- 管理者が無効化済みユーザーを再有効化できる
- 再有効化されたユーザーがログインできる

## 完了条件

- [ ] 管理者がユーザー詳細画面からユーザーを無効化できる
- [ ] 管理者が無効化済みユーザーを再有効化できる
- [ ] 一般ユーザーには無効化ボタンが表示されない
- [ ] 無効化されたユーザーが一覧・詳細に「無効化済み」バッジで表示される
- [ ] 無効化されたユーザーがログインを試みると失敗する
- [ ] 存在しないユーザーに対してはエラーメッセージが表示される
- [ ] ビルド・バリデーションが通る
- [ ] テストが通る

## 参考実装

- `features/user/delete/delete-user-dialog.client.tsx` - 確認ダイアログのパターン
- `features/user/delete/delete-user.action.ts` - キャッシュ再検証パターン
- [Supabase Admin API ドキュメント](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid) - `ban_duration` の使用方法
