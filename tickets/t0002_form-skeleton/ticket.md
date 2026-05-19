# T0002: フォームスケルトンコンポーネントの実装

## 概要

フォームの Suspense fallback で使用している disabled 状態のフォーム presenter を、CLSが発生しないピクセルパーフェクトな専用スケルトンコンポーネントに置き換える。

## 背景

現在、`CustomerSearchForm`、`StaffSearchForm`、`CustomerNotesSearchForm` の Suspense fallback には disabled 状態のフォーム自体を渡している。これを `CustomerEditFormSkeleton` と同様に専用のスケルトンコンポーネントに置き換えることで、ローディング状態の視認性を向上させる。

## 要件

- CLS（Cumulative Layout Shift）が発生しないピクセルパーフェクトなスケルトン
- フォントスタイル（ボールド）、フォント高さ、行の高さ、パディングを考慮
- 実際のフォームと同一のDOM構造・スタイルを維持
- 既存の `CustomerEditFormSkeleton` のパターンに準拠（各フォーム専用のスケルトンを作成）

---

## 対象箇所

| 対象                    | ファイル                                                       | 現在の fallback         |
| ----------------------- | -------------------------------------------------------------- | ----------------------- |
| CustomerSearchForm      | `apps/web/app/(private)/customers/page.tsx`                    | disabled 状態のフォーム |
| StaffSearchForm         | `apps/web/app/(private)/staffs/page.tsx`                       | disabled 状態のフォーム |
| CustomerNotesSearchForm | `apps/web/app/(private)/customers/[customerId]/notes/page.tsx` | disabled 状態のフォーム |

---

## 詳細分析

### 1. CustomerSearchFormのDOM構造

**ファイル**: `apps/web/features/customer/list/customer-search-form-presenter.tsx`

```
FormItem (space-y-2)
├── FormLabel ("キーワード")
│   └── text-sm font-bold leading-none
├── FormDescription
│   └── text-sm text-muted-foreground
│   └── 内容: "姓名、セイメイ、電話番号、メールアドレスを前方一致で検索（最大300文字）"
└── div (flex gap-4 items-center)
    ├── Input (h-9 w-full rounded-md)
    └── Button (h-9) + Search アイコン (mr-2 h-4 w-4) + "検索"
```

### 2. StaffSearchFormのDOM構造

**ファイル**: `apps/web/features/staff/list/staff-search-form-presenter.tsx`

CustomerSearchForm と**同一の構造**。

- FormDescription の内容のみ異なる: "姓または名で完全一致検索（最大300文字）"

### 3. CustomerNotesSearchFormのDOM構造

**ファイル**: `apps/web/features/customer-note/list/customer-notes-search-form.tsx`

```
Collapsible (デフォルト閉じ)
└── Card
    └── CardHeader (py-2, cursor-pointer)
        ├── CardTitle ("検索", h-6)
        ├── Badge (activeFilterCount > 0 の場合のみ)
        └── ChevronDown/Up アイコン (h-5 w-5)
```

スケルトンは閉じた状態（CardHeader のみ）を再現する。

---

## 実装計画

### Step 1: CustomerSearchFormSkeletonの作成

**新規作成**: `apps/web/features/customer/list/customer-search-form-skeleton.tsx`

```tsx
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CustomerSearchFormSkeleton() {
  return (
    <div aria-busy="true">
      <div className="sr-only">読み込み中</div>
      <div className="space-y-2">
        {/* FormLabel */}
        <span className="text-sm leading-none font-bold">キーワード</span>

        {/* FormDescription */}
        <p className="text-sm text-muted-foreground">
          姓名、セイメイ、電話番号、メールアドレスを前方一致で検索（最大300文字）
        </p>

        {/* Input + Button */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-[76px] rounded-md" />
        </div>
      </div>
    </div>
  );
}
```

### Step 2: StaffSearchFormSkeletonの作成

**新規作成**: `apps/web/features/staff/list/staff-search-form-skeleton.tsx`

```tsx
import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffSearchFormSkeleton() {
  return (
    <div aria-busy="true">
      <div className="sr-only">読み込み中</div>
      <div className="space-y-2">
        {/* FormLabel */}
        <span className="text-sm leading-none font-bold">キーワード</span>

        {/* FormDescription */}
        <p className="text-sm text-muted-foreground">
          姓または名で完全一致検索（最大300文字）
        </p>

        {/* Input + Button */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-[76px] rounded-md" />
        </div>
      </div>
    </div>
  );
}
```

### CLS防止のためのスタイル対応

| 要素            | 実フォームのスタイル             | スケルトンの対応                                            |
| --------------- | -------------------------------- | ----------------------------------------------------------- |
| FormItem        | `space-y-2`                      | `space-y-2`                                                 |
| FormLabel       | `text-sm font-bold leading-none` | `text-sm font-bold leading-none` + 実テキスト「キーワード」 |
| FormDescription | `text-sm text-muted-foreground`  | 同クラス + 実テキスト                                       |
| Input           | `h-9 w-full rounded-md`          | `Skeleton className="h-9 w-full rounded-md"`                |
| Button          | `h-9` + アイコン + テキスト      | `Skeleton className="h-9 w-[76px] rounded-md"`              |

**ボタン幅の計算**:

- `px-4` (16px × 2 = 32px) + アイコン (16px) + `mr-2` (8px) + テキスト「検索」(約20px) ≈ 76px

### Step 3: customers/page.tsxの更新

```tsx
// 追加import
import { CustomerSearchFormSkeleton } from "@/features/customer/list/customer-search-form-skeleton";

// 変更（CustomerSearchForm の import を削除）
<SuspenseOnSearch fallback={<CustomerSearchFormSkeleton />}>
```

### Step 4: staffs/page.tsxの更新

```tsx
// 追加import
import { StaffSearchFormSkeleton } from "@/features/staff/list/staff-search-form-skeleton";

// 変更（StaffSearchForm の import を削除）
<SuspenseOnSearch fallback={<StaffSearchFormSkeleton />}>
```

---

## 確認事項

### ビジュアル確認（必須）

- 開発サーバーでスケルトン→実フォームの遷移時にレイアウトシフトがないことを確認
- Chrome DevTools で両状態の高さを測定し、差異がないことを確認

### アクセシビリティ

- `aria-busy="true"` と `sr-only` で「読み込み中」を伝達（既存パターンに従う）

---

## 関連ファイル

| ファイル                                                                       | 役割                                           |
| ------------------------------------------------------------------------------ | ---------------------------------------------- |
| `apps/web/features/customer/list/customer-search-form-skeleton.tsx`            | 新規作成: 顧客検索フォーム専用スケルトン       |
| `apps/web/features/staff/list/staff-search-form-skeleton.tsx`                  | 新規作成: スタッフ検索フォーム専用スケルトン   |
| `apps/web/features/customer-note/list/customer-notes-search-form-skeleton.tsx` | 新規作成: 顧客ノート検索フォーム専用スケルトン |
| `apps/web/app/(private)/customers/page.tsx`                                    | 変更: fallback をスケルトンに置換              |
| `apps/web/app/(private)/staffs/page.tsx`                                       | 変更: fallback をスケルトンに置換              |
| `apps/web/app/(private)/customers/[customerId]/notes/page.tsx`                 | 変更: fallback をスケルトンに置換              |
| `apps/web/features/customer/edit/customer-edit-form-skeleton.tsx`              | 参考: 既存スケルトン実装パターン               |
