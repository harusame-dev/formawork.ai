---
paths:
  - "**/*.tsx"
---

# Next.js コンポーネント設計

## Server Component First

- Server Component での実装を最優先とし、ユーザーのインタラクションが必要な場合にのみクライアントコンポーネントを採用する
- データの取得は極力末端で行い、上位からバケツリレーで下位に渡すことを避ける

## Container/Presentational パターン

データフェッチやロジックを Container で行い、 表示を Presenter で行う

```tsx
// スキーマはコンポーネント外（または別ファイル）に定義する
const searchParamsSchema = v.object({ keyword: v.optional(v.string()) });

function Page({ searchParams }: PageProps<'/'>) {
  return (
    <div>
      <Suspense fallback={<SayHelloSkeleton />}>
        <SayHelloContainer />
      </Suspense>
      <Suspense fallback={<FooListSkeleton />}>
        <FooListContainer
          condition={searchParams.then((params) => v.parse(searchParamsSchema, params))}
        />
      </Suspense>
    </div>
  );
}
```

```tsx
async function SayHelloContainer(){
  'use cache: private'

  const userName = await getLoggedInUserName()

  return <SayHelloPresenter name={userName} />
}

function SayHelloPresenter({name}: {name: string}){
  return <div>こんにちは {name}</div>
}
```

```tsx
type FooListContainerProps = {
  condition: Promise<{keyword?: string}>
}

async function FooListContainer({condition}: FooListContainerProps){
  const { keyword } = await condition;

  const foos = await getFooList(keyword)

  if (foos.length){
    return <FooListPresenter foos={foos} />
  } else {
    return <div>foo が見つかりませんでした</div>
  }
}
```
