# T0001: ユーザーオンボーディング機能

## 概要

初回ログインユーザー向けのプロダクトツアーを実装し、デモシステム利用者の離脱を防止する。

## 背景・課題

- ログイン後のホームページが空で、ユーザーが何をすべきか分からない
- メニューボタン（左上ハンバーガー）の存在に気づかないと機能にアクセスできない
- 顧客一覧がメイン機能だが、導線が弱い

---

## 機能要件

### オンボーディングフロー（8ステップ）

| Step | ページ | 対象要素 | メッセージ内容 | 遷移設定 |
|------|--------|----------|----------------|----------|
| 1 | `/` | ウェルカムエリア | 「FORMAWORK.AI CRMへようこそ！このガイドでは主要な機能をご紹介します。」 | - |
| 2 | `/` | 注意事項エリア | 「【ご注意】このデモ環境は誰でも閲覧可能です。機密情報や実際の個人情報は登録しないでください。また、データは予告なくリセットされる場合があります。」 | - |
| 3 | `/` | メニューボタン | 「左上のメニューボタンをクリックすると、各機能にアクセスできます。」 | メニュー自動オープン |
| 4 | `/` | 顧客一覧リンク | 「顧客一覧では、登録されている顧客情報を確認できます。クリックして移動しましょう。」 | nextRoute: `/customers` |
| 5 | `/customers` | 検索フォーム | 「キーワード検索で顧客を絞り込めます。姓名、電話番号、メールアドレスで検索可能です。」 | prevRoute: `/` |
| 6 | `/customers` | 顧客テーブル | 「検索結果がこちらに表示されます。顧客名をクリックして詳細を確認しましょう。」 | - |
| 7 | `/customers/[id]` | 顧客情報 | 「顧客の基本情報を確認できます。タブを切り替えて、ノートやメモリも確認できます。」 | - |
| 8 | `/customers/[id]` | ノートタブ | 「以上で主要機能のガイドは終了です。それでは FORMAWORK.AI をお楽しみください！」 | - |

### 操作仕様

| 項目 | 仕様 |
|------|------|
| スキップ機能 | あり（×ボタン）。スキップ時も完了として扱い、再表示しない |
| 戻るボタン | あり（ステップ2以降で表示） |
| 次へボタン | あり（最終ステップは「完了」ボタン） |
| 完了状態の保存 | localStorage（キー: `onboarding-completed`） |
| 再実行機能 | なし |
| 顧客詳細への遷移 | ユーザーによる手動クリック |

### エッジケース対応

| ケース | 対応 |
|--------|------|
| 顧客が0件の場合 | ステップ6で「まだ顧客が登録されていません。新規登録から始めましょう。」と表示し、ステップ6で完了 |
| localStorage無効 | オンボーディングは毎回表示される（エラーにはしない） |
| ページ離脱・リロード | 完了していなければ最初から再開 |
| 戻るボタンでページ遷移が必要 | prevRouteで自動遷移 |
| オンボーディング中にログアウト | 完了していなければ次回ログイン時に再開 |

---

## 非機能要件

| 項目 | 要件 |
|------|------|
| 対応ブラウザ | Chrome、Firefox、Safari、Edge（最新版） |
| レスポンシブ | デスクトップ優先（タブレット・モバイルでも動作するがUXは最適化しない） |
| アニメーション | framer-motion（duration: 0.3s, type: spring） |
| アクセシビリティ | キーボード操作対応（Tab、Enter、Escape） |
| パフォーマンス | Client Component として実装（SSR不要） |

---

## UI設計

### カスタムカードデザイン

| 項目 | 仕様 |
|------|------|
| 幅 | 320px（w-80） |
| 背景色 | 白（Card コンポーネント準拠） |
| ボーダー | border-primary/20 |
| シャドウ | shadow-lg |

### カード構成

```
┌─────────────────────────────────────┐
│ [アイコン] タイトル           [×]  │  ← CardHeader
│ ステップ N / 8                     │
├─────────────────────────────────────┤
│                                     │
│ メッセージ内容                      │  ← CardContent
│                                     │
├─────────────────────────────────────┤
│ [戻る]                    [次へ]   │  ← CardFooter
└─────────────────────────────────────┘
         ▼ （矢印: onborda提供）
```

### ボタン仕様

| ボタン | ラベル | スタイル | サイズ |
|--------|--------|----------|--------|
| 次へ | 「次へ」 | Button (default) | sm |
| 戻る | 「戻る」 | Button (outline) | sm |
| 完了 | 「完了」 | Button (default) | sm |
| スキップ | X アイコン | Button (ghost, icon) | h-6 w-6 |

### ステップアイコン

| Step | アイコン | タイトル |
|------|----------|----------|
| 1 | 👋 | ようこそ！ |
| 2 | ⚠️ | ご注意 |
| 3 | 📋 | メニューを開く |
| 4 | 👥 | 顧客一覧 |
| 5 | 🔍 | 顧客を検索 |
| 6 | 📊 | 顧客一覧テーブル |
| 7 | 📝 | 顧客詳細 |
| 8 | 🎉 | ガイド完了！ |

---

## 技術仕様

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|------------|------------|------|
| `onborda` | 最新 | オンボーディングUI |
| `framer-motion` | 最新 | アニメーション（peer dependency） |

### onborda 設定

```tsx
<Onborda
  steps={steps}
  showOnborda={shouldShow}
  shadowRgb="0,0,0"
  shadowOpacity="0.5"
  cardComponent={OnboardingCard}
  cardTransition={{ duration: 0.3, type: "spring" }}
>
```

### ツアー設定

```tsx
{
  tour: "main",
  steps: [ /* 8ステップ */ ]
}
```

### Tailwind CSS設定

```typescript
// tailwind.config.ts
content: [
  './node_modules/onborda/dist/**/*.{js,ts,jsx,tsx}' // 追加
]
```

### ディレクトリ構成

```
apps/web/features/onboarding/
├── components/
│   └── onboarding-card.tsx      # カスタムカード（shadcn/ui）
├── hooks/
│   └── use-onboarding.ts        # localStorage 状態管理
├── constants/
│   └── steps.tsx                # ステップ定義
└── providers/
    └── onboarding-provider.tsx  # OnbordaProvider ラッパー
```

### ID命名規則

| 要素 | ID | 配置ファイル |
|------|-----|--------------|
| ウェルカムエリア | `onboarding-welcome` | `app/(private)/page.tsx` |
| 注意事項エリア | `onboarding-caution` | `app/(private)/page.tsx` |
| メニューボタン | `onboarding-menu-button` | `navigation-menu.tsx` |
| 顧客一覧リンク | `onboarding-customer-menu` | `navigation-menu.tsx` |
| 検索フォーム | `onboarding-search-form` | `customers/page.tsx` |
| 顧客テーブル | `onboarding-customer-table` | `customers/page.tsx` |
| 顧客情報エリア | `onboarding-customer-info` | `customers/[customerId]/layout.tsx` |
| ノートタブ | `onboarding-notes-tab` | `customer-detail-tabs.tsx` |

---

## ファイル変更一覧

### 新規作成ファイル（4ファイル）

| ファイル | 説明 |
|----------|------|
| `features/onboarding/hooks/use-onboarding.ts` | localStorage 完了状態管理 |
| `features/onboarding/constants/steps.tsx` | 8ステップ定義 |
| `features/onboarding/components/onboarding-card.tsx` | カスタムカード |
| `features/onboarding/providers/onboarding-provider.tsx` | Provider ラッパー |

### 修正ファイル（7ファイル）

| ファイル | 変更内容 |
|----------|----------|
| `tailwind.config.ts` | onborda クラス読み込み設定追加 |
| `app/(private)/layout.tsx` | OnboardingWrapper でラップ |
| `app/(private)/page.tsx` | ウェルカム・注意事項メッセージ表示、ID 付与 |
| `app/(private)/_components/navigation-menu.tsx` | ID 付与、自動オープンロジック |
| `app/(private)/customers/page.tsx` | 検索フォーム・テーブルに ID 付与 |
| `app/(private)/customers/[customerId]/layout.tsx` | 顧客情報エリアに ID 付与 |
| `features/customer/detail/customer-detail-tabs.tsx` | ノートタブに ID 付与 |

---

## 実装タスク

### Phase 1: 基盤構築
- [ ] `onborda` `framer-motion` パッケージのインストール
- [ ] `tailwind.config.ts` に onborda クラス読み込み設定追加
- [ ] `use-onboarding.ts` フック実装
- [ ] `steps.tsx` ステップ定義（8ステップ）
- [ ] `onboarding-card.tsx` カスタムカード実装
- [ ] `onboarding-provider.tsx` Provider 実装

### Phase 2: 既存コンポーネント修正
- [ ] `app/(private)/layout.tsx` に Provider 設置
- [ ] `app/(private)/page.tsx` ウェルカム・注意事項メッセージ追加 + ID
- [ ] `navigation-menu.tsx` に ID + 自動オープンロジック
- [ ] `customers/page.tsx` に ID 付与
- [ ] `customers/[customerId]/layout.tsx` に ID 付与
- [ ] `customer-detail-tabs.tsx` に ID 付与

### Phase 3: テスト・検証
- [ ] 全8ステップの動作確認
- [ ] スキップ機能の動作確認（完了扱いになること）
- [ ] 戻るボタンの動作確認（ページ遷移含む）
- [ ] エッジケース：顧客0件の動作確認
- [ ] localStorage 完了状態の永続化確認
- [ ] キーボード操作（Tab, Enter, Escape）の確認
- [ ] 主要ブラウザでの動作確認

---

## 受け入れ条件

### 機能要件
- [ ] 初回ログイン後、オンボーディングが自動開始される
- [ ] 8ステップが順番に表示される
- [ ] ステップ2でデモ環境の注意事項が表示される
- [ ] 各ステップでスキップボタン（×）が機能し、完了扱いになる
- [ ] ステップ2以降で戻るボタンが機能する
- [ ] 完了後、再度ログインしてもオンボーディングが表示されない
- [ ] ステップ3でメニューが自動で開く
- [ ] ステップ4「次へ」で顧客一覧ページに自動遷移する
- [ ] ステップ6から7はユーザーが顧客をクリックして手動遷移
- [ ] 顧客0件の場合、ステップ6で適切なメッセージが表示され完了できる

### 非機能要件
- [ ] キーボード操作（Tab, Enter, Escape）で操作できる
- [ ] アニメーションがスムーズに動作する
- [ ] Chrome, Firefox, Safari, Edge で正常に動作する

---

## 備考

- onborda ドキュメント: https://github.com/uixmat/onborda
- 対象要素には `id="onboarding-xxx"` 形式で ID を付与
- 将来的に他のツアー（スタッフ管理など）を追加する可能性あり
- ツアー名は `"main"` を使用
