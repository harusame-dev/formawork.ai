# チケット 00: 不要機能の削除

## 概要

タスク・案件管理システムへの移行にあたり、美容室 CRM 固有の機能を削除する。
後続チケットの作業前に完了させることで、コードベースをクリーンな状態にする。

## 背景

既存コードには以下の CRM 固有機能が含まれており、新システムでは不要となる。
これらを残したまま新機能を実装すると混乱が生じるため、最初に削除する。

## 削除対象

### ページ・ルート

| パス | 内容 |
|---|---|
| `apps/web/app/(public)/lp/` | ランディングページ |
| `apps/web/app/(private)/customers/` | 顧客管理ページ一式 |
| `apps/web/app/api/cron/generate-memory/` | AI メモリー生成 Cron |
| `apps/web/app/api/cron/generate-advice/` | AI アドバイス生成 Cron |
| `apps/web/app/api/customer-notes/[noteId]/advice/` | 顧客ノートアドバイス API |

### features モジュール

| パス | 内容 |
|---|---|
| `apps/web/features/customer/` | 顧客管理機能一式 |
| `apps/web/features/customer-note/` | 顧客ノート機能一式（AI アドバイスを含む） |
| `apps/web/features/customer-memory/` | 顧客メモリー機能一式 |
| `apps/web/features/onboarding/` | オンボーディング機能一式 |

### packages

| パス | 内容 |
|---|---|
| 削除対象なし | DB・UI・logger・supabase パッケージは流用する |

### 依存ライブラリ（package.json から削除）

| ライブラリ | 用途 |
|---|---|
| `ai` | AI SDK（LLM 呼び出し） |
| `@ai-sdk/valibot` | AI SDK Valibot 統合 |
| `onborda` | オンボーディング UI |
| `framer-motion` | オンボーディングアニメーション（他で使用していなければ） |
| `swr` | AI アドバイスのポーリング（他で使用していなければ） |

### Supabase 設定

- `supabase/migrations/` の AI 関連トリガー・関数があれば削除対象とする
- `supabase/seed.sql` の顧客データ部分を削除する

## 作業手順

1. `apps/web/app/(public)/lp/` を削除
2. `/` (public) へのリダイレクトを `/login` に変更（または LP なしの構成に修正）
3. `apps/web/app/(private)/customers/` を削除
4. `apps/web/app/api/cron/` を削除
5. `apps/web/app/api/customer-notes/` を削除
6. `apps/web/features/customer/`、`customer-note/`、`customer-memory/`、`onboarding/` を削除
7. 不要ライブラリを `package.json` から削除
8. `pnpm -w validate:check` でデッドコード・型エラーがないことを確認
9. `pnpm -w build` でビルドが通ることを確認

## 完了条件

- [ ] 削除対象ファイルがすべて存在しない
- [ ] デッドコード検出（knip）でエラーなし
- [ ] ビルドが通る
- [ ] 既存の認証・スタッフ管理機能（ログイン・`/staffs`）は引き続き動作する
