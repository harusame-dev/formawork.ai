# Formawork AI

AI を活用した顧客管理システムのポートフォリオプロジェクトです。

## Demo

**[https://formawork-ai-web.vercel.app/lp](https://formawork-ai-web.vercel.app/lp)**

「無料でデモを体験する」→「ログイン」で管理者としてデモを体験できます。(一部機能に制限があります)

## Screenshots

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

## Features

- **認証・認可**: メールアドレスとパスワードによる認証、ロールベースによる権限制御
- **顧客管理**: 顧客情報の登録・編集・削除、名前での部分一致検索、ページネーション
- **スタッフ管理**: スタッフの登録・編集・削除、ロールの割り当て
- **顧客ノート**: 接客記録の作成、画像の添付
- **AI メモリ**: 顧客ノートから重要情報を自動抽出し、カテゴリ分類して蓄積
- **AI アドバイス**: 蓄積したメモリとノートを分析し、次回接客のアドバイスを生成

## Highlights

### AI 機能

AI 生成は時間がかかるため、Supabase Queue (pgmq) でバックグラウンド処理し、クライアントで定期フェッチすることで UX を向上。さらに AI サービスの一時的障害に備え、Exponential Backoff リトライでロバスト性を確保

### 型安全性

実行前に不具合を発見することで DX とシステム品質を向上。DB 層（Drizzle ORM）から API 層（valibot + Result 型）まで全レイヤーで型を一貫して保証し、AI 駆動開発のガードレールとしても活用

### Next.js 機能の活用

- **Server Components**: データ取得とレンダリングをサーバーで実行し、端末性能やネットワーク速度に依存しない安定した表示速度を実現。クライアントバンドル最小化により初期ロードも高速化
- **Server Actions**: 型安全な API リクエストにより、実行前のエラー検出と開発効率を向上
- **PPR + Suspense**: 静的シェルを即座に表示し、動的コンテンツを段階的にストリーミングすることで体感待ち時間を削減
- **use cache**: データキャッシュにより DB リクエストを削減し、レスポンスを高速化
- **Image Optimization**: 端末に最適化された画像配信と遅延読み込みにより、ページ読み込み速度を向上

### テスト設計

E2E テストをベースに振る舞いをテストしつつ、テストサイズごとに責務を分離。実行速度と品質を両立させるため Small / Medium / Large / Browser の 4 層構成で整備

## Tech Stack

| カテゴリ | 技術 | 選定理由 |
|---------|------|----------|
| フレームワーク | Next.js 16, React 19 | デファクトスタンダードでエンジニア人口が多く持続可能性が高い。事例・学習リソースが豊富で AI コーディングとの相性も良い |
| 言語 | TypeScript 5.9 (Strict) | 型安全により実行前にエラーを検出でき、品質向上と AI 駆動開発の両方に寄与 |
| スタイリング | Tailwind CSS 4, shadcn/ui | アクセシビリティ準拠かつソースコードを直接編集可能。不具合時も自分で修正でき、フルカスタマイズが可能 |
| DB | Supabase (PostgreSQL) | 無料枠があり Auth 機能も利用可能。PostgreSQL ベースのためサービス終了時も別サービスへ移行が容易。ローカル開発環境が充実しテスタビリティが高い |
| ORM | Drizzle ORM | 軽量で SQL に近い API のため学習コストが低い。Bun や Cloudflare Workers など様々なランタイムで動作しポータビリティが高い |
| バリデーション | valibot | Zod と同等の機能で約 1/10 のバンドルサイズ（~5KB）。クライアントでも使用するためサイズは重要 |
| フォーム | react-hook-form | Next.js の useActionState ではクライアントサイドバリデーションが行えないため採用。非制御フォームで再レンダリングも最小化 |
| テスト | Vitest Browser Mode, Playwright | jsdom ではなく実ブラウザで実行するため、実際の動作に近いテストが可能 |
| CI/CD | GitHub Actions, Vercel | 定番の組み合わせで情報が多い。Vercel は Next.js との親和性が高くゼロコンフィグでデプロイ可能 |
| AI | Vercel AI SDK | 現在は無料枠のある Gemini を使用しているが、性能面でベストかは不明。実運用では GPT や Claude など別モデルを使う可能性が高いため、切り替えを容易にする抽象化層として採用 |
| キュー | Supabase Queue (pgmq) | PostgreSQL ベースのため別途キューインフラ不要。Exponential Backoff リトライで一時的障害に対応 |
| ロギング | pino | Node.js 最速クラスのロガー。JSON 構造化ログでクラウド監視サービスとの連携が容易 |
| パッケージ管理 | pnpm Catalog Mode | モノレポ全体で依存バージョンを一元管理。npm/yarn より高速かつディスク効率が良い |

## Architecture

### モノレポ構成

pnpm workspaces + Catalog Mode で依存関係を一元管理。

| パッケージ | 説明 |
|-----------|------|
| `apps/web` | Next.js Web アプリケーション |
| `packages/db` | Drizzle ORM スキーマ・マイグレーション |
| `packages/ui` | shadcn/ui コンポーネント |
| `packages/logger` | 構造化ロギング（センシティブ情報自動マスキング） |
| `packages/supabase` | 認証・ストレージ設定 |

### 設計パターン

#### Server Component First + Container/Presenter

```typescript
// Container: データ取得（Server Component）
async function CustomersContainer({ condition }: Props) {
  const data = await getCustomers(condition);
  return <CustomersPresenter {...data} />;
}

// Presenter: 表示のみ（Pure Component でテストしやすい）
function CustomersPresenter({ customers }: Props) {
  return <ul>{customers.map(c => <CustomerCard key={c.id} {...c} />)}</ul>;
}
```

#### フィーチャーベースディレクトリ

各機能は Schema → Logic → Action → Component の層構造で整理。

```
features/customer/register/
├── schema.ts                   # valibot スキーマ
├── register-customer.ts        # ビジネスロジック（Result 型で成功/失敗を返却）
├── register-customer-action.ts # Server Action
└── edit-customer-form.tsx      # react-hook-form コンポーネント
```

#### Server Action ファクトリー

`createServerAction` でラップし、認証・バリデーション・ロギングを共通化。

```typescript
export const registerCustomerAction = createServerAction(registerCustomer, {
  name: "registerCustomer",
  schema: registerCustomerSchema,
});
// → 認証チェック、valibot バリデーション、構造化ロギング、Result 型でエラー返却
```

#### Parallel Routes によるモーダル

URL と連動したモーダル表示。ブラウザバックでモーダルが閉じる。

```
customers/[customerId]/
├── layout.tsx          # @action スロットを受け取る
├── page.tsx
├── @action/
│   ├── default.tsx     # null（モーダル非表示）
│   └── edit/page.tsx   # モーダル表示
└── edit/page.tsx       # 直接アクセス時はフルページ
```

#### DB スキーマ設計

```typescript
// Generated Columns で検索用フィールドを自動生成
fullName: text("full_name").generatedAlwaysAs(
  sql`${table.lastName} || ${table.firstName}`
),

// text_pattern_ops でプレフィックス検索を高速化
index("idx_customers_last_name", table.lastName).using("btree", sql`text_pattern_ops`),
```

## AI Integration

Vercel AI SDK と Supabase Queue (pgmq) を組み合わせて実装。

### アーキテクチャ

```
顧客ノート登録 → Supabase Queue にジョブ追加 → バックグラウンドで AI 処理 → 結果を DB に保存
```

- **UX**: 重い AI 処理をバックグラウンドで実行するため、ノート登録時のレスポンスを高速に保つ
- **リトライ**: Exponential Backoff で一時的なエラー（API レート制限など）から自動復帰
- **ストリーミング**: アドバイス生成時は AI SDK のストリーミングで逐次表示

### 機能

| 機能 | 説明 |
|------|------|
| **顧客メモリ自動生成** | ノート登録時に重要情報を抽出。6 カテゴリ分類、重要度スコア付与 |
| **接客アドバイス** | 蓄積メモリとノートを分析し、次回接客のアドバイスを生成 |

## Code Quality

### テスト

Google Testing Blog のテストサイズ分類に基づき、振る舞いテスト（実装詳細ではなくユーザー視点）を重視。

| サイズ | ファイル名 | 説明 |
|--------|-----------|------|
| Small | `*.small.server.test.ts` | 外部依存なしのユニットテスト |
| Medium | `*.medium.server.test.ts` | ローカル DB を使った統合テスト |
| Large | `*.e2e.test.ts` | Playwright E2E テスト |
| Browser | `*.browser.test.tsx` | Vitest Browser Mode（実ブラウザ） |

### 静的解析

| ツール | 用途 |
|--------|------|
| Biome | Lint / Format |
| Knip | デッドコード・未使用エクスポート検出 |
| cspell | スペルチェック |
| TypeScript | Strict Mode 型チェック |

### CI/CD

```
PR → 静的解析 → Browser テスト → Server テスト → E2E → AI レビュー → マージ → 自動デプロイ
```

## Getting Started

### 必要な環境

- Node.js 22.x
- pnpm 10.x
- Docker (Supabase ローカル用)

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp apps/web/.env.sample apps/web/.env
cp packages/db/.env.sample packages/db/.env
cp packages/supabase/.env.sample packages/supabase/.env
# apps/web/.env の AI_GATEWAY_API_KEY に Vercel or Gemini の API キーを設定

# Supabase 起動（初回のみ）
pnpm -w supabase:start && pnpm -w supabase:seed

# DB セットアップ
pnpm -w db:reset

# 開発サーバー起動
pnpm -w dev
```

### コマンド一覧

```bash
pnpm -w dev             # 開発サーバー
pnpm -w build           # 本番ビルド
pnpm -w test:browser    # ブラウザテスト
pnpm -w test:server     # サーバーテスト
pnpm -w test:e2e        # E2E テスト
pnpm -w validate:check  # 静的解析
pnpm -w validate:fix    # 自動修正
```
