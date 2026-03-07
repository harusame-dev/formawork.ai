---
paths: 
  - **/layout.tsx
  - **/page.tsx
---

# Next.js Page & Layout

### params と searchParams の扱い

- Page/Layout で `params` や `searchParams` を `await` すると、そのコンポーネントが Dynamic になってしまため、 Page/Layout での `await` を避け、`.then()` で変換して子コンポーネントに Promise として渡すこと
- `.then()` 内でデストラクチャリングを使用してシンプルに記述すること
- `searchParams` は `.then()` 内で必ず valibot でパースすること


## Suspense とローディング状態

### Container 配置時の必須対応
- Container コンポーネント（async component）を配置する際は、**Page/Layout コンポーネント側で必ず** `Suspense` でラップすること
- Container 自体に Suspense を配置してはいけない
  - **例外**: Container 内で別の Container や非同期コンポーネントをネストする場合は、Container 内で Suspense を配置すること
- `fallback` には専用のスケルトンコンポーネントを指定すること
- スケルトンはロード後のデザインと一致させ、CLS（Cumulative Layout Shift）を防ぐこと

### スケルトンの種類
- **通常のコンテンツ**: `Skeleton` コンポーネントを使用してロード後のレイアウトと同じ構造を作成
- **フォームコンポーネント**: 入力フィールドを `disabled` にした実際のフォームコンポーネントを配置


### 実装例

```tsx
// Page コンポーネント（Suspense を配置）
export default async function Page({
  params,
  searchParams
}: PageProps<"/foo/[id]">) {
  const idPromise = params.then(({ id }) => id);
  const searchConditionPromise = searchParams.then((sp) =>
    parseFooParams(sp)
  );

  return (
    <Suspense fallback={<FooSkeleton />}>
      <FooContainer
        idPromise={idPromise}
        searchConditionPromise={searchConditionPromise}
      />
    </Suspense>
  );
}

// Container コンポーネント（Suspense は含めない）
async function FooContainer({
  idPromise,
  fooParamsPromise
}: FooContainerProps) {
  const [id,params] = await Promise.all([idPromise, fooParamsPromise]);
  const data = await getData(id, searchCondition);

  return <FooPresenter data={data} />;
}

// スケルトンコンポーネント（ロード後と完全に一致するレイアウト）
function FooSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

// フォームの場合
function FooFormSkeleton() {
  return <FooForm disabled />;  // 実際のフォームを disabled で表示
}
