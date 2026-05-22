# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) が本リポジトリ内のコードを扱う際の手順や指針をまとめたものです。

## リポジトリ概要

本リポジトリは美容室・クリニック・エステ等の対面接客業向け AI CRM システム FORMAWORK.ai のモノレポです。

## フォルダ構成

```
apps/
  web/           # メインの Web アプリケーション（@workspace/web）
    app/         # App Router ルート
    features/    # 機能別モジュール
packages/
  db/            # Drizzle スキーマとクライアント
  ui/            # shadcn/ui コンポーネント
  logger/        # pino ベースのロガー
  supabase/      # Supabase 設定
  tsconfig/      # 共通 TypeScript 設定
```

## 主要コマンド

```bash
pnpm -w dev            # Supabase + Next.js 開発サーバー起動（UTC タイムゾーン）
pnpm -w build          # ビルド
pnpm -w validate:check # lint・format・デッドコード・スペル・型チェック
pnpm -w validate:fix   # lint・format の自動修正
pnpm -w db:generate    # マイグレーションファイル生成（DB 適用なし）
pnpm -w db:migrate     # マイグレーション実行
pnpm -w db:reset       # DB リセット・再マイグレーション・シード
pnpm -w test:browser   # Vitest ブラウザテスト
pnpm -w test:server    # Vitest サーバーサイドテスト
pnpm -w test:e2e       # Playwright E2E テスト
```

### 使用可能な CLI コマンド

- gh
- supabase
- vercel
- sentry
- playwright-cli（ブラウザ操作時に必ず使用）

## プロジェクト情報

### ブランチ命名規則

| ブランチ種別 | 命名規則                     | 例                      |
| ------------ | ---------------------------- | ----------------------- |
| メイン       | `main`                       | `main`                  |
| 開発         | `<チケット番号>-<task-name>` | `156-fix-note-register` |

### 開発環境

- 開発サーバー：http://localhost:3000
- DB：postgresql://postgres:postgres@127.0.0.1:62022/postgres

## ワークフロー

一連の編集完了時に以下を実施し、すべてがパスするまで修正を繰り返す。

- バリデーションチェック（lint・format・デッドコード・スペル・型チェック）
- ビルド
- Vitest テスト
- ブラウザでの動作確認
  - 機能が動作すること（ブラウザを操作して確認）
  - 画面崩れ（スクリーンショットで確認）
  - ログチェック（ブラウザ・開発サーバーにエラーメッセージが出ていないこと）
- e2eテスト（DBリセット後実施）

## 参考ドキュメント

重要：タスクに関連ある agent-docs 配下のドキュメントを必ず参照すること

## 調査依頼の回答、実装計画、レビュー結果の報告

以下の要件を満たす HTML ファイル１枚として作成すること
また、作成後はユーザーにパス（file:///）を表示し、 open コマンドで開くこと
なお、HTML ファイルで作成するのはユーザーが理解、判断をしやすくするためであり、 過剰な装飾求めるものではない

## 要件

- HTML ファイルの作成フォルダ： .work/reports/
- グラフ、テーブル、シンタックスハイライト、diff 表示、SVG などを活用してユーザーに理解しやすい表現を行うこと
  - グラフ:mermaid
  - 色付け:shiki
  - diff:diff2html（side-by-side）
  - コード提示する場合は行数も表示する
- セクションコードにカードブロックで分離する
- 横幅は制限せずウィンドウの横幅をフルで活用する
- コードの変更を記載するとき既存コードと変更予定コードを diff で表示する

## 例外

- 回答が十分に短い(200文字程度)場合
- グラフ表示やテーブル表示などが不要で HTML で表現する必要がない場合
  ~
  ~
  ~
  ~
  ~
  ~
