# チケット 03: ユーザー管理機能（管理者専用）

## 概要

既存のスタッフ管理機能（`/staffs`）を **ユーザー管理機能**（`/users`）として移行・拡張する。
管理者によるパスワード再設定機能とユーザー無効化機能を追加する。

## 背景

スタッフ管理（CRUD）は実装済みであり、ユーザー管理として転用できる。
「スタッフ = アプリを使う社内メンバー」という構造はそのまま維持する。
ただし、現在はパスワード再設定・ユーザー無効化が管理者画面から操作できないため、追加が必要。

## 現状

| 機能 | 実装状況 | 変更要否 |
|---|---|---|
| ユーザー一覧表示（`/staffs`） | 実装済み | ルート変更のみ |
| ユーザー新規追加（`/staffs/new`） | 実装済み | ルート変更のみ |
| ユーザー詳細（`/staffs/[staffId]`） | 実装済み | ルート変更のみ |
| ユーザー編集（`/staffs/[staffId]/edit`） | 実装済み | ルート変更のみ |
| ユーザー削除 | 実装済み | ルート変更のみ |
| 管理者によるパスワード再設定 | **未実装** | **新規実装** |
| ユーザー無効化（ログイン禁止） | **未実装** | **新規実装** |
| 管理者権限チェック | 実装済み | 確認のみ |

## 変更内容

### 1. ルート変更

`/staffs` → `/users` にルートをリネームする。

```
app/(private)/staffs/           → app/(private)/users/
app/(private)/staffs/new/       → app/(private)/users/new/
app/(private)/staffs/[staffId]/ → app/(private)/users/[userId]/
```

### 2. features のリネーム・移行

```
features/staff/          → features/user/
features/staff/list/     → features/user/list/
features/staff/detail/   → features/user/detail/
features/staff/register/ → features/user/register/
features/staff/edit/     → features/user/edit/
features/staff/delete/   → features/user/delete/
```

### 3. ナビゲーションの更新

サイドバー・ヘッダーの「スタッフ」リンクを「ユーザー」に変更する。

### 4. 管理者によるパスワード再設定（新規実装）

- ユーザー詳細画面またはユーザー編集画面にパスワード再設定フォームを追加
- Supabase Admin API（`supabase.auth.admin.updateUserById`）でパスワードを更新
- **管理者のみ操作可能**（一般ユーザーはアクセス不可）
- Server Action で実装する

**入力項目**:
- 新しいパスワード（8文字以上等、バリデーションは既存 `change-password` スキーマを参考にする）
- 確認用パスワード

### 5. ユーザー無効化（新規実装）

- Supabase Admin API（`supabase.auth.admin.updateUserById({ banned: true })`）でユーザーを無効化
- 無効化されたユーザーはログイン不可（セッションも即時無効化）
- ユーザー一覧・詳細に「無効化済み」バッジを表示
- 管理者が無効化を解除（再有効化）できる
- **管理者のみ操作可能**

### 6. 表示名の変更

- UI の「スタッフ」という表現を「ユーザー」または「メンバー」に変更する
- ページタイトル・ラベル・エラーメッセージ等の文言を更新する

## 変更しないもの

- `staffs` テーブルのスキーマ（DB 変更なし）
- Supabase Auth の app_metadata 構造（role / staffId）
- `features/auth/` 配下の認証ロジック
- `features/auth/user/role.ts` のロール定義

## 参考実装

- 既存 `features/staff/` の Server Action・ページ構造をそのまま移行する
- Supabase Admin API は `SUPABASE_SERVICE_ROLE_KEY` を使用するため Server Action 内で呼び出す

## 完了条件

- [ ] `/users` でユーザー一覧が表示される
- [ ] 管理者がユーザーを新規追加できる（初期パスワード設定を含む）
- [ ] 管理者がユーザー情報（氏名・メール・権限）を編集できる
- [ ] 管理者がユーザーを削除できる
- [ ] 管理者が他ユーザーのパスワードを再設定できる
- [ ] 管理者がユーザーを無効化／再有効化できる
- [ ] 一般ユーザーがユーザー管理画面にアクセスすると 403 またはリダイレクトされる
- [ ] ビルド・バリデーションが通る
