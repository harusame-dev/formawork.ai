---
paths:
  - "**/layout.tsx"
  - "**/page.tsx"
---

# Next.js Page & Layout

### params と searchParams の扱い

- Page/Layout で `params` や `searchParams` を `await` すると、そのコンポーネントが Dynamic になってしまため、 Page/Layout での `await` を避け、`.then()` で変換して子コンポーネントに Promise として渡すこと
- `.then()` 内でデストラクチャリングを使用してシンプルに記述すること
- `searchParams` は `.then()` 内で必ず valibot でパースすること

## Suspense とローディング状態

### Container 配置時の必須対応

- Container コンポーネント（async component）を配置する際は、**Page/Layout コンポーネント側で必ず** `Suspense` でラップすること
- `fallback` には専用のスケルトンコンポーネントを指定すること
- スケルトンはロード後のデザインと一致させ、CLS（Cumulative Layout Shift）を防ぐこと

### スケルトンの種類

- **通常のコンテンツ**: `Skeleton` コンポーネントを使用してロード後のレイアウトと同じ構造を作成
- **フォームコンポーネント**: 入力フィールドを `disabled` にした実際のフォームコンポーネントを配置
