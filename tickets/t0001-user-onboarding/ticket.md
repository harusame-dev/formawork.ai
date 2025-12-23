# T0001: ユーザーオンボーディング機能

## 概要

初回ログインユーザー向けのプロダクトツアーを実装し、デモシステム利用者の離脱を防止する。

## 背景・課題

- ログイン後のホームページが空で、ユーザーが何をすべきか分からない
- メニューボタン（左上ハンバーガー）の存在に気づかないと機能にアクセスできない
- 顧客一覧がメイン機能だが、導線が弱い

---

## 機能要件

### オンボーディングフロー（9ステップ）

シードデータの顧客ID `00000000-0000-0000-0000-000000000001` を使用して遷移する。

| Step | ページ                     | 対象要素         | メッセージ内容                                                                                                                           | side         | 遷移設定                                                     |
| ---- | -------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| 1    | `/`                        | ウェルカムエリア | 「FORMAWORK.AI CRMへようこそ！」                                                                                                         | bottom       | -                                                            |
| 2    | `/`                        | 注意事項エリア   | 「注意事項です。ご確認ください。」                                                                                                       | bottom       | -                                                            |
| 3    | `/`                        | メニューボタン   | 「左上のメニューボタンをクリックすると、各機能にアクセスできます。」                                                                     | bottom-left  | メニュー自動オープン                                         |
| 4    | `/`                        | 顧客一覧リンク   | 「顧客の管理や接客ノートの記録、AIによる接客アドバイス・顧客メモリなどが確認できます。」                                                 | bottom-left  | nextRoute: `/customers`                                      |
| 5    | `/customers`               | 検索フォーム     | 「姓名、電話番号、メールアドレスで検索可能です。」                                                                                       | bottom       | -                                                            |
| 6    | `/customers`               | 顧客リンク       | 「顧客名を選択すると詳細画面に遷移します。」                                                                                             | top-left     | nextRoute: `/customers/00000000-0000-0000-0000-000000000001` |
| 7    | `/customers/[id]`          | 基本情報タブ     | 「顧客の生年月日や住所など、基本情報が閲覧できます。」                                                                                   | bottom-left  | nextRoute: `/customers/[id]/notes`（[id]は上記顧客ID）       |
| 8    | `/customers/[id]/notes`    | ノートタブ       | 「接客内容を記録できます。自動で AI が接客内容のアドバイスと顧客情報をメモリに記録していきます。」                                       | bottom       | nextRoute: `/customers/[id]/memories`（[id]は上記顧客ID）    |
| 9    | `/customers/[id]/memories` | メモリタブ       | 「接客ノートからAIが自動で重要な事柄を記録します。手動での管理も行えます。」＋「以上で使い方ガイドは完了です。ご自由にお試しください。」 | bottom-right | -                                                            |

### 操作仕様

| 項目             | 仕様                                                      |
| ---------------- | --------------------------------------------------------- |
| スキップ機能     | あり（×ボタン）。スキップ時も完了として扱い、再表示しない |
| 戻るボタン       | なし（削除済み）                                          |
| 次へボタン       | あり（最終ステップは「完了」ボタン）                      |
| 完了状態の保存   | localStorage（キー: `onboarding-completed`）              |
| 再実行機能       | あり（トップページの「使い方ガイドを見る」ボタン）        |
| 顧客詳細への遷移 | 自動遷移（ステップ6で次へクリック時）                     |

### エッジケース対応

| ケース                         | 対応                                                     |
| ------------------------------ | -------------------------------------------------------- |
| 顧客が0件の場合                | シードデータで顧客が存在するため、このケースは発生しない |
| localStorage無効               | オンボーディングは毎回表示される（エラーにはしない）     |
| ページ離脱・リロード           | 完了していなければ最初から再開                           |
| オンボーディング中にログアウト | 完了していなければ次回ログイン時に再開                   |

---

## 非機能要件

| 項目             | 要件                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 対応ブラウザ     | Chrome、Firefox、Safari、Edge（最新版）                                |
| レスポンシブ     | デスクトップ優先（タブレット・モバイルでも動作するがUXは最適化しない） |
| アニメーション   | framer-motion（duration: 0.6s, type: spring）                          |
| アクセシビリティ | キーボード操作対応（Tab、Enter、Escape）                               |
| パフォーマンス   | Client Component として実装（SSR不要）                                 |

---

## UI設計

### カスタムカードデザイン

| 項目     | 仕様                          |
| -------- | ----------------------------- |
| 幅       | 320px（w-80）                 |
| 背景色   | 白（Card コンポーネント準拠） |
| ボーダー | border-primary/20             |
| シャドウ | shadow-lg                     |

### カード構成

```
┌─────────────────────────────────────┐
│ [アイコン] タイトル           [×]  │  ← CardHeader
├─────────────────────────────────────┤
│                                     │
│ メッセージ内容                      │  ← CardContent
│                                     │
├─────────────────────────────────────┤
│ N / 9                     [次へ]   │  ← CardFooter
└─────────────────────────────────────┘
         ▼ （矢印: onborda提供）
```

### ボタン仕様

| ボタン   | ラベル                 | スタイル             | サイズ  |
| -------- | ---------------------- | -------------------- | ------- |
| 次へ     | 「次へ」               | Button (default)     | sm      |
| 完了     | 「完了」               | Button (default)     | sm      |
| スキップ | X アイコン             | Button (ghost, icon) | h-6 w-6 |
| 再開     | 「使い方ガイドを見る」 | Button (outline)     | default |

### ステップアイコン（Lucide React）

| Step | アイコン        | タイトル       |
| ---- | --------------- | -------------- |
| 1    | `Hand`          | ようこそ！     |
| 2    | `TriangleAlert` | ご注意         |
| 3    | `Menu`          | メニューを開く |
| 4    | `Users`         | 顧客一覧       |
| 5    | `Search`        | 顧客を検索     |
| 6    | `User`          | 顧客を選択     |
| 7    | `Info`          | 顧客詳細       |
| 8    | `NotebookPen`   | 接客ノート     |
| 9    | `Brain`         | メモリ         |

---

## 技術仕様

### 使用ライブラリ

| ライブラリ      | バージョン | 用途                              |
| --------------- | ---------- | --------------------------------- |
| `onborda`       | 最新       | オンボーディングUI                |
| `framer-motion` | 最新       | アニメーション（peer dependency） |

### onborda 設定

```tsx
<Onborda
  cardComponent={OnboardingCard}
  cardTransition={{ duration: 0.6, type: "spring" }}
  shadowOpacity="0.5"
  shadowRgb="0,0,0"
  showOnborda={shouldShow}
  steps={[{ steps: steps, tour: TOUR_NAME }]}
>
```

### ツアー設定

```tsx
// TOUR_NAME = "main"
[
  {
    tour: "main",
    steps: [ /* 9ステップ */ ]
  }
]
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
│   ├── onboarding-card.tsx      # カスタムカード（shadcn/ui）
│   └── start-tour-button.tsx    # ツアー開始ボタン
├── hooks/
│   └── use-onboarding.ts        # localStorage 状態管理
├── constants/
│   └── steps.tsx                # ステップ定義・オンボーディングID定数
└── providers/
    └── onboarding-provider.tsx  # OnbordaProvider ラッパー
```

### ID命名規則

| 要素             | ID                          | 配置ファイル               |
| ---------------- | --------------------------- | -------------------------- |
| ウェルカムエリア | `onboarding-welcome`        | `app/(private)/page.tsx`   |
| 注意事項エリア   | `onboarding-caution`        | `app/(private)/page.tsx`   |
| メニューボタン   | `onboarding-menu-button`    | `navigation-menu.tsx`      |
| 顧客一覧リンク   | `onboarding-customer-menu`  | `navigation-menu.tsx`      |
| 検索フォーム     | `onboarding-search-form`    | `customers/page.tsx`       |
| 顧客リンク       | `onboarding-first-customer` | `customers/page.tsx`       |
| 基本情報タブ     | `onboarding-basic-info-tab` | `customer-detail-tabs.tsx` |
| ノートタブ       | `onboarding-notes-tab`      | `customer-detail-tabs.tsx` |
| メモリタブ       | `onboarding-memories-tab`   | `customer-detail-tabs.tsx` |

---

## ファイル変更一覧

### 新規作成ファイル（5ファイル）

| ファイル                                                | 説明                                                  |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `features/onboarding/hooks/use-onboarding.ts`           | localStorage 完了状態管理・スクロール・ハイライト調整 |
| `features/onboarding/constants/steps.tsx`               | 9ステップ定義・オンボーディングID定数                 |
| `features/onboarding/components/onboarding-card.tsx`    | カスタムカード                                        |
| `features/onboarding/components/start-tour-button.tsx`  | ツアー開始ボタン                                      |
| `features/onboarding/providers/onboarding-provider.tsx` | Provider ラッパー                                     |

### 修正ファイル

| ファイル                                            | 変更内容                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `tailwind.config.ts`                                | onborda クラス読み込み設定追加                                    |
| `app/(private)/layout.tsx`                          | Onboarding でラップ                                               |
| `app/(private)/page.tsx`                            | ウェルカム・注意事項メッセージ表示、ID 付与、ツアー開始ボタン追加 |
| `app/(private)/_components/navigation-menu.tsx`     | ID 付与、自動オープンロジック                                     |
| `app/(private)/_components/header.tsx`              | トップページへのリンク追加                                        |
| `app/(private)/customers/page.tsx`                  | 検索フォーム・顧客リンクに ID 付与                                |
| `features/customer/detail/customer-detail-tabs.tsx` | 基本情報・ノート・メモリタブに ID 付与                            |
| `e2e/setups/user.setup.ts`                          | E2Eテストでオンボーディングスキップ設定追加                       |
| `e2e/logout.e2e.test.ts`                            | E2Eテストでオンボーディングスキップ設定追加                       |
| `e2e/password-change.e2e.test.ts`                   | E2Eテストでオンボーディングスキップ設定追加                       |

---

## 実装タスク

### Phase 1: 基盤構築
- [x] `onborda` `framer-motion` パッケージのインストール
- [x] `tailwind.config.ts` に onborda クラス読み込み設定追加
- [x] `use-onboarding.ts` フック実装
- [x] `steps.tsx` ステップ定義（9ステップ）・ID定数定義
- [x] `onboarding-card.tsx` カスタムカード実装
- [x] `onboarding-provider.tsx` Provider 実装
- [x] `start-tour-button.tsx` ツアー開始ボタン実装

### Phase 2: 既存コンポーネント修正
- [x] `app/(private)/layout.tsx` に Provider 設置
- [x] `app/(private)/page.tsx` ウェルカム・注意事項メッセージ追加 + ID + ツアー開始ボタン
- [x] `navigation-menu.tsx` に ID + 自動オープンロジック
- [x] `header.tsx` にトップページへのリンク追加
- [x] `customers/page.tsx` に ID 付与
- [x] `customer-detail-tabs.tsx` に ID 付与

### Phase 3: UI改善・調整
- [x] アイコンを絵文字から Lucide React アイコンに変更
- [x] カードのレイアウトをコンパクト化
- [x] アニメーション速度の調整
- [x] スクロール・ハイライト位置調整ロジックの実装
- [x] 戻るボタンの削除

### Phase 4: E2Eテスト対応
- [x] `user.setup.ts` でオンボーディングスキップ設定追加
- [x] `logout.e2e.test.ts` でオンボーディングスキップ設定追加
- [x] `password-change.e2e.test.ts` でオンボーディングスキップ設定追加
- [x] オンボーディング実装の影響で発生した strict mode violation 対応（セレクタを `getByRole("main")` でスコープ化）
  - 根本原因は不明だが、セレクタが2つの要素にマッチする問題が発生

---

## 受け入れ条件

### 機能要件
- [x] 初回ログイン後、オンボーディングが自動開始される
- [x] 9ステップが順番に表示される
- [x] ステップ2でデモ環境の注意事項が表示される
- [x] 各ステップでスキップボタン（×）が機能し、完了扱いになる
- [x] 完了後、再度ログインしてもオンボーディングが表示されない
- [x] ステップ3でメニューが自動で開く
- [x] ステップ4「次へ」で顧客一覧ページに自動遷移する
- [x] ステップ6「次へ」で顧客詳細ページに自動遷移する
- [x] トップページの「使い方ガイドを見る」ボタンでオンボーディングを再開できる

### 非機能要件
- [x] キーボード操作（Tab, Enter, Escape）で操作できる
- [x] アニメーションがスムーズに動作する
- [x] Chrome で正常に動作する

### E2Eテスト対応
- [x] E2Eテストでオンボーディングがスキップされ、テストが正常に実行される

---

## 備考

- onborda ドキュメント: https://github.com/uixmat/onborda
- 対象要素には `id="onboarding-xxx"` 形式で ID を付与
- 将来的に他のツアー（スタッフ管理など）を追加する可能性あり
- ツアー名は `"main"` を使用

---

## 実装完了コミット一覧

| コミットハッシュ      | 内容                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| `05c92ee`             | ユーザーオンボーディング機能のチケットを追加                             |
| `f342414`             | ユーザーオンボーディング機能を追加                                       |
| `c607149`             | ページ遷移時にナビゲーションメニューのSheetを閉じるよう修正              |
| `7d753bf`             | オンボーディング中のハイライト要素へのクリックをブロック                 |
| `a185066` - `d69faf3` | ステップ遷移・自動遷移の実装                                             |
| `9bb6d10`             | オンボーディングにメモリステップを追加                                   |
| `68c2fae`             | オンボーディングステップのアイコンを絵文字からLucide Reactアイコンに変更 |
| `73a683d`             | オンボーディングカードから戻るボタンを削除                               |
| `2264299` - `60de5e0` | スクロール・表示改善                                                     |
| `9064b9d` - `9bdf61d` | オンボーディング開始ボタンをホーム画面に移動                             |
| `e364a72`             | オンボーディング状態管理をuseOnboardingに統合                            |
| `caa4584`             | オンボーディングフローを簡素化し、ステップ内容を更新                     |
| `2868814`             | オンボーディングIDを定数化してコンポーネント間で共有                     |
| `16ae085`             | ヘッダータイトルとナビゲーションメニューにトップページへのリンクを追加   |
| `51bd39b`             | オンボーディングカードのレイアウトをコンパクト化                         |
| `950f307`             | オンボーディング最終ステップの文言とレイアウトを調整                     |
| `49beb7c`             | E2Eテストのセットアップでオンボーディングをスキップ                      |
| `b341e49`             | 独自ログインを行うE2Eテストでもオンボーディングをスキップ                |
| `8a35d23`             | E2Eテストのセレクタをmainロールでスコープ化（strict mode violation対応） |
| `082ec60`             | E2Eテストのセレクタをmainロールでスコープ化（追加修正）                  |
