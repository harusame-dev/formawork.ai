# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) が本リポジトリ内のコードを扱う際の手順や指針をまとめたものです。

## リポジトリ概要

本リポジトリは、社内利用を想定した和文→英訳の翻訳支援（CAT）ツールのモノレポです。
Word／PPT から抽出した原文を 1 文単位（セグメント）に分割し、対訳エディタ上で AI 英訳（Claude API）・翻訳メモリ（過去訳）・用語集を参照しながら翻訳者が訳文を仕上げます。確定した訳文は翻訳メモリへ蓄積し、次の翻訳で再利用します。

### 主要ドメイン概念

- **プロジェクト**：翻訳案件の単位。可視性（Public／招待者のみの Private）、専用の用語集・翻訳メモリ・過去翻訳一覧を持つ
- **ワーク**：1 ワーク = 1 ドキュメント。アップロードした原文を翻訳し仕上げる作業単位
- **セグメント**：翻訳の最小単位（原則 1 文）。原文・訳文・確定状態を持ち、対訳エディタの 1 行に対応
- **翻訳メモリ（TM）**：確定済み対訳の蓄積。pgvector による意味的類似検索（OpenAI 埋め込み）で「類似の過去訳」を提示
- **用語集**：プロジェクト固有の用語集と、全プロジェクト横断の共通用語集

### 技術選定

- フレームワーク：Next.js（App Router）
- DB／認証：Supabase（認可は RLS ではなくアプリ層 `createServerAction` で実施）
- 類似検索：pgvector + OpenAI `text-embedding-3`（Claude には埋め込み API が無いため）
- AI 英訳：Claude API（公式 SDK を直接利用。抽象化層は設けない）
- ドキュメント抽出：ライブラリでテキスト抽出（まず docx）、文分割はルールベース＋手動結合

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

以下に従って HTML ファイル１枚として作成すること
また、作成後はユーザーにパス（file:///）を表示すること
なお、HTML ファイルで作成するのはユーザーが理解、判断をしやすくするためであり、 過剰な装飾求めるものではない

### 要件

- HTML ファイルの作成フォルダ： docs/reports/
- グラフ、テーブル、シンタックスハイライト、diff 表示、SVG などを活用してユーザーに理解しやすい表現を行うこと
  - グラフ:mermaid
  - 色付け:shiki
  - diff:diff2html（side-by-side）
  - コード提示する場合は行数も表示する
- セクションコードにカードブロックで分離する
- 横幅は制限せずウィンドウの横幅をフルで活用する
- コードの変更を記載するとき既存コードと変更予定コードを diff で表示する

### 例外

- 回答が十分に短い(200文字程度)場合
- グラフ表示やテーブル表示などが不要で HTML で表現する必要がない場合
