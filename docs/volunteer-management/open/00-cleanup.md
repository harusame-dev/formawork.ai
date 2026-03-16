# チケット 00: 既存タスク管理システムの削除

## 概要

ボランティア来場管理システムへの移行にあたり、タスク・案件管理システム固有の機能を削除する。
後続チケットの作業前に完了させることで、コードベースをクリーンな状態にする。

## 背景

既存コードにはタスク・案件管理システム固有の機能が含まれており、新システムでは不要となる。
これらを残したまま新機能を実装すると混乱が生じるため、最初に削除する。

## 削除対象

### ページ・ルート

| パス | 内容 |
|---|---|
| `apps/web/app/(private)/projects/` | 案件管理ページ一式 |
| `apps/web/app/(private)/tasks/` | タスク管理ページ一式（全タスク一覧等） |
| `apps/web/app/(private)/staffs/` | スタッフ管理ページ一式 |
| `apps/web/app/(private)/dashboard/` | ダッシュボードページ |

### features モジュール

| パス | 内容 |
|---|---|
| `apps/web/features/project/` | 案件管理機能一式 |
| `apps/web/features/task/` | タスク管理機能一式 |
| `apps/web/features/staff/` | スタッフ管理機能一式 |
| `apps/web/features/dashboard/` | ダッシュボード機能一式 |

### packages

| パス | 内容 |
|---|---|
| 削除対象なし | DB・UI・logger・supabase パッケージは流用する |

### 依存ライブラリ（package.json から削除）

タスク管理システム専用のライブラリがあれば削除する。
流用可能なライブラリ（shadcn/ui、Drizzle、Supabase 等）はそのまま残す。

## 作業手順

1. `apps/web/app/(private)/projects/` を削除
2. `apps/web/app/(private)/tasks/` を削除
3. `apps/web/app/(private)/staffs/` を削除
4. `apps/web/app/(private)/dashboard/` を削除
5. `apps/web/features/project/` を削除
6. `apps/web/features/task/` を削除
7. `apps/web/features/staff/` を削除
8. `apps/web/features/dashboard/` を削除
9. `apps/web/app/(private)/` のルートレイアウト・ナビゲーションを確認し、削除済みリンクを除去
10. `pnpm -w validate:check` でデッドコード・型エラーがないことを確認
11. `pnpm -w build` でビルドが通ることを確認

## 完了条件

- [ ] 削除対象ファイルがすべて存在しない
- [ ] デッドコード検出（knip）でエラーなし
- [ ] `pnpm -w validate:check` が通る
- [ ] `pnpm -w build` が通る
- [ ] 既存の認証機能（ログイン・ログアウト）は引き続き動作する
