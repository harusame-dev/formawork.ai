# チケット 09: 管理者によるパスワード再設定

## 概要

管理者がユーザー詳細画面から他ユーザーのパスワードを再設定できる機能を追加する。
Supabase Admin API（`supabase.auth.admin.updateUserById`）を使用してサーバーサイドでパスワードを更新する。

## 背景

チケット03でユーザー管理機能（`/users`）への移行を完了した。
ユーザーが自分でパスワードを変更する機能（`/settings/password`）は実装済みだが、
管理者が他ユーザーのパスワードを再設定する機能がないため、追加が必要。

## 現状

| 機能 | 実装状況 |
|---|---|
| 自分のパスワード変更（`/settings/password`） | 実装済み |
| 管理者による他ユーザーのパスワード再設定 | **未実装** |

## 変更内容

### 1. スキーマ（`features/user/reset-password/schema.ts`）

```ts
import * as v from "valibot";

export const resetUserPasswordSchema = v.object({
  userId: v.string(),
  newPassword: v.pipe(
    v.string("新しいパスワードを入力してください"),
    v.minLength(8, "パスワードは8文字以上で入力してください"),
    v.maxLength(64, "パスワードは64文字以内で入力してください"),
  ),
});
```

### 2. パスワード再設定ロジック（`features/user/reset-password/reset-user-password.ts`）

- `supabase.auth.admin.updateUserById(userId, { password: newPassword })` でパスワードを更新
- エラーハンドリング：対象ユーザーが存在しない場合はエラーを返す

### 3. Server Action（`features/user/reset-password/reset-user-password.action.ts`）

- `AdminRole` のみ実行可能（`getCurrentUserRole()` でチェック）
- `createServerAction` ラッパーを使用
- 成功後はリダイレクトなし（同ページに留まりトースト表示）

### 4. フォームコンポーネント（`features/user/reset-password/reset-user-password-form.client.tsx`）

- `"use client"` コンポーネント
- 入力項目: 新しいパスワード（type="password"）
- バリデーション: valibot + react-hook-form
- 成功時: 「パスワードを再設定しました」トースト表示

### 5. Container（`features/user/reset-password/reset-user-password-form.server.tsx`）

- `"use server"` 境界は不要（props 渡しのみ）
- `userId` を受け取り `ResetUserPasswordForm` に渡す

### 6. ユーザー詳細ページの更新（`app/(private)/users/[userId]/page.tsx`）

- `getCurrentUserRole()` で現在のユーザーが `AdminRole` の場合のみ `ResetUserPasswordFormContainer` を表示
- 編集・削除フォームとは別セクションとして配置

## ディレクトリ構成

```
features/user/reset-password/
├── schema.ts
├── reset-user-password.ts
├── reset-user-password.action.ts
├── reset-user-password-form.client.tsx
└── reset-user-password-form.server.tsx
```

## テスト

### サーバーテスト（medium）

`features/user/reset-password/reset-user-password.medium.server.test.ts`

- 管理者が有効なユーザーのパスワードを再設定できる
- 存在しないユーザーIDを指定するとエラーを返す

### Server Action テスト（small）

`features/user/reset-password/reset-user-password-action.small.server.test.ts`

- 管理者以外がアクセスするとエラーになる
- スキーマバリデーションが機能する

### ブラウザテスト（small）

`features/user/reset-password/reset-user-password-form.small.browser.test.tsx`

- パスワードが8文字未満の場合バリデーションエラーが表示される
- パスワードが64文字を超える場合バリデーションエラーが表示される

## 完了条件

- [ ] 管理者がユーザー詳細画面からパスワードを再設定できる
- [ ] 一般ユーザーにはパスワード再設定フォームが表示されない
- [ ] パスワードが8文字未満の場合はバリデーションエラーが表示される
- [ ] パスワードが64文字を超える場合はバリデーションエラーが表示される
- [ ] 存在しないユーザーに対してはエラーメッセージが表示される
- [ ] ビルド・バリデーションが通る
- [ ] テストが通る

## 参考実装

- `features/auth/change-password/` - 自分のパスワード変更の実装
- `features/user/delete/delete-user.action.ts` - Admin API を使用する Server Action の実装パターン
