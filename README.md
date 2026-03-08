# Formawork AI

AI を活用した顧客管理システムのポートフォリオプロジェクトです。

## デモ

**[https://formawork-ai-web.vercel.app/lp](https://formawork-ai-web.vercel.app/lp)**

「無料でデモを体験する」→「ログイン」で管理者としてデモを体験できます。(一部機能に制限があります)

## スクリーンショット

<table>
  <tr>
    <td align="center"><strong>顧客ノート</strong></td>
    <td align="center"><strong>AI アドバイス機能</strong></td>
    <td align="center"><strong>AI メモリ機能</strong></td>
  </tr>
  <tr>
    <td><img src="docs/readme/ss-customer-note.png" alt="顧客ノート" width="300"></td>
    <td><img src="docs/readme/ss-ai-advice.png" alt="AI アドバイス機能" width="300"></td>
    <td><img src="docs/readme/ss-ai-memories.png" alt="AI メモリ機能" width="300"></td>
  </tr>
  <tr>
    <td>接客記録と画像を保存</td>
    <td>顧客ノートを分析し、接客アドバイスを生成</td>
    <td>重要情報を AI が抽出・カテゴリ分類</td>
  </tr>
</table>

## 解決する課題（想定）

- **データ共有**: Excel・紙管理では最新情報が共有できない → クラウドで常に全スタッフが最新データを参照
- **AI 活用のハードル**: AI 操作を覚える必要がある → 通常通りノートを記録するだけで AI が自動処理
- **記録が活用されない**: 次の接客時に見返す余裕がない → AI アドバイスで過去記録を即座に活用
- **導入のハードル**: 専用アプリのインストール・複雑な操作が必要 → Web アプリでスマホから利用可能

## 技術スタック

| カテゴリ       | 技術                            |
| -------------- | ------------------------------- |
| フレームワーク | Next.js 16, React 19            |
| 言語           | TypeScript 5.9 (Strict)         |
| スタイリング   | Tailwind CSS 4, shadcn/ui       |
| DB             | Supabase (PostgreSQL)           |
| ORM            | Drizzle ORM                     |
| バリデーション | valibot                         |
| フォーム       | react-hook-form                 |
| テスト         | Vitest Browser Mode, Playwright |
| CI/CD          | GitHub Actions, Vercel          |
| AI             | Vercel AI SDK                   |
| キュー         | Supabase Queue (pgmq)           |
| ロギング       | pino                            |
| パッケージ管理 | pnpm Catalog Mode               |

## 機能一覧

- **認証・認可**: メールアドレスとパスワードによる認証、ロールベースによる権限制御
- **顧客管理**: 顧客情報の登録・編集・削除、名前での部分一致検索、ページネーション
- **スタッフ管理**: スタッフの登録・編集・削除、ロールの割り当て
- **顧客ノート**: 接客記録の作成、画像の添付
- **AI メモリ**: 顧客ノートから重要情報を自動抽出し、カテゴリ分類して蓄積
- **AI アドバイス**: 蓄積したメモリとノートを分析し、次回接客のアドバイスを生成

## アーキテクチャ

### モノレポ構成（pnpm workspaces）

| パッケージ          | 説明                                             |
| ------------------- | ------------------------------------------------ |
| `apps/web`          | Next.js Web アプリケーション                     |
| `packages/db`       | Drizzle ORM スキーマ・マイグレーション           |
| `packages/ui`       | shadcn/ui コンポーネント                         |
| `packages/logger`   | 構造化ロギング（センシティブ情報自動マスキング） |
| `packages/supabase` | 認証・ストレージ設定                             |

### 設計方針

- **Server Component First + Container/Presenter**: データ取得はサーバー側で実行し、Presenter は Pure Component としてテスタビリティを確保
- **フィーチャーベースディレクトリ**: 機能ごとにスキーマ・ロジック・Action・UI をまとめて管理
- **Server Action ファクトリー**: 認証・バリデーション・ロギングを共通化した抽象化層
- **アプリケーション層での認可**: RLS はデフォルト拒否のセーフガードとして使用し、認可ロジックはアプリコードに集約
- **型安全**: DB 層（Drizzle）から API 層（valibot + Result 型）まで全レイヤーで型を保証

### AI 統合

顧客ノート登録 → Supabase Queue にジョブ追加 → バックグラウンドで AI 処理 → 結果を DB に保存

Supabase Queue (pgmq) でバックグラウンド処理し、ノート登録時のレスポンスを高速に維持。Exponential Backoff リトライで一時的障害に対応。

### テスト

Google Testing Blog のテストサイズ分類（Small / Medium / Large）で責務を分離し、振る舞いテストを基本方針とする。

| サイズ | ファイル名                | 説明                                            |
| ------ | ------------------------- | ----------------------------------------------- |
| Small  | `*.small.server.test.ts`  | 外部依存なしのユニットテスト                    |
| Small  | `*.browser.test.tsx`      | Vitest Browser Mode（実ブラウザでコンポーネント）|
| Medium | `*.medium.server.test.ts` | ローカル DB を使った統合テスト                  |
| Large  | `*.e2e.test.ts`           | Playwright E2E テスト                           |

## AI 駆動開発

本プロジェクトは Claude Code を活用した AI 駆動開発で構築しています。ただし、AI 生成コードを理解せずそのまま採用する「バイブコーディング」は採用していません。

- **コード生成**: Claude Code でコード生成・リファクタリングを実施
- **レビュー**: 生成コードは人間がレビューし理解した上で採用
- **品質担保**: 型チェック・Lint・テストを CI で自動実行。AI 生成コードも同じ基準を適用
- **設計判断**: アーキテクチャや設計方針は人間が決定。AI は実装の補助として活用

Claude Code の設定方針・活用方法は [`docs/claude-code/`](docs/claude-code/) にまとめています。
`agent-docs/` には各機能領域のガイドラインを整備し、`CLAUDE.md` と `.claude/` でコーディングルールを定義しています。
