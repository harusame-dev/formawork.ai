## プロジェクト概要

AI Formawork は顧客・顧客ノート・スタッフを管理する B2B SaaS プラットフォーム。日常的な CRM 業務を一元管理する社内オペレーター向けワークスペース。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16.0.1 (App Router) |
| UI | React 19.2.0、shadcn/ui、Tailwind CSS 4.x |
| 言語 | TypeScript 5.9.3 |
| パッケージマネージャー | pnpm 10.12.4 (catalog mode) |
| データベース | PostgreSQL (Supabase)、Drizzle ORM |
| フォーム | react-hook-form + valibot |
| ロギング | pino (`@repo/logger`) |
| テスト | Vitest (Browser Mode) + Playwright (E2E) |
| Lint/Format | Biome |

## ディレクトリ構成

```
apps/web/
  app/
    (private)/    # 認証が必要なルート
    (public)/     # 公開ルート
  features/       # 機能別モジュール (auth, customer, customer-note, staff)
  components/     # 共通コンポーネント
  libs/           # ユーティリティ
packages/
  db/             # Drizzle スキーマとクライアント
  ui/             # shadcn/ui コンポーネント
  logger/         # pino ベースのロガー
  supabase/       # Supabase 設定
  tsconfig/       # 共通 TypeScript 設定
```

## 主要コマンド

```bash
pnpm -w dev            # Supabase + Next.js 開発サーバー起動（UTC タイムゾーン）
pnpm -w build          # 本番ビルド
pnpm -w validate:check # lint・format・デッドコード・スペル・型チェック
pnpm -w validate:fix   # lint・format の自動修正
pnpm -w db:generate    # マイグレーションファイル生成（DB 適用なし）
pnpm -w db:migrate     # マイグレーション実行
pnpm -w db:reset       # DB リセット・再マイグレーション・シード
pnpm -w test:browser   # Vitest Browser Mode テスト
pnpm -w test:server    # サーバーサイドテスト
pnpm -w test:e2e       # Playwright E2E テスト
```

## コーディング規約

詳細: `.claude/rules/coding-conventions.md`（`**/*.ts`, `**/*.tsx` に自動適用）

主要ルール:
- `interface` より `type` を優先、アロー関数より `function` を優先
- `enum` は使用しない（Object Literal を使用）
- 環境変数は valibot でパースした設定モジュール経由でアクセス
- 自明なコメントは書かない、単一使用の中間変数・型は最小化
- ファイル名: kebab-case、コンポーネント: PascalCase、関数・変数: camelCase

## ワークフロールール

- **タスク開始前**: `mcp__serena__list_memories` でメモリ一覧を確認する
- **実装時**: 下記の「追加ドキュメント」テーブルから関連する `agent-docs/` を読み込む
- **ファイル読み込み・編集・検索**: 常に Serena MCP ツールを優先して使用する
- **GitHub 操作**: `gh` コマンドを使用する
- **エージェント呼び出し詳細**: `agent-docs/agent-workflow.md` を参照

### エージェント実行順序（必ず守ること）
1. ファイル編集・作成・削除後 → まず `code-validator` を実行
2. バリデーションが全パスしたことを確認
3. その後 `changes-committer` を実行

**`code-validator` と `changes-committer` を並列実行してはならない。**

## 追加ドキュメント

タスク種別に応じて、実装前に該当する `agent-docs/` ファイルを読み込むこと：

| タスク種別 | 参照するドキュメント |
|-----------|-------------------|
| タスク開始 / 完了前 | `agent-docs/agent-workflow.md`、`agent-docs/task-completion.md` |
| Next.js コンポーネント・Server Action・Route Handler | `agent-docs/nextjs-architecture.md` |
| `page.tsx` / `layout.tsx` の実装 | `agent-docs/nextjs-page-layout.md` |
| `use cache` によるキャッシュ | `agent-docs/nextjs-cache-strategy.md` |
| UI コンポーネント・ユーザー向け機能 | `agent-docs/ux-guidelines.md` |
| フォーム実装 | `agent-docs/form-implementation.md` |
| テスト作成 | `agent-docs/test-guidelines.md` |
| GitHub Actions ワークフロー | `agent-docs/github-actions.md` |
| データベーススキーマ・マイグレーション | `agent-docs/database-migration.md` |
| ロギング実装 | `agent-docs/logging-implementation.md` |
| モノレポパッケージ構成 | `agent-docs/monorepo-guidelines.md` |
| メモリ管理システムの更新 | `agent-docs/claude-code-memory-management.md` |
