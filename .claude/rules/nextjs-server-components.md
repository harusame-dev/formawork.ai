---
paths:
  - *.server.tsx
  - page.tsx
  - layout.tsx
---

# Next.js Server Components

## ロジックの切り出し

データの取得やデータ整形などのロジックを直接記載せず、外部ファイルに切り出す
ロジックの呼び出し、コンポーネントのだしわけ、 jsx のみを記載する


```tsx
async function FooBar(){
  const fooResult = await handleFooResult(await getFoo());

  if (foo.type === 'bar'){
    return <FooBar foo={foo} />
  }

  return <Foo foo={foo} />
}
```

## データフェッチ

データフェッチは必ずデータを必要とする末端のコンポーネントで行い、 Suspense で Skeleton 表示を行う

```tsx
async function UserArticles(){
  // 上位のコンポーネントでデータを取得しない
  // const name = await getName();  
  // const articles = await getArticles();
  
  return <div>
    {/*Suspense もデータ取得の最小単位で Skeleton 表示を行う*/}
    <Suspense fallback={<UserNameSkeleton />}>  
      <UserNameContainer />
    </Suspense>
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesContainer />
    </Suspense>
  </div>
}
```
