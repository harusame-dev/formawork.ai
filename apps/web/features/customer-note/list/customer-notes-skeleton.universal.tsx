import type React from "react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

function AdviceSectionSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-1">
      {/* タイトル: アイコン + ラベル */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-3.5" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* 本文 */}
      <div className="pl-5">
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}

function CustomerNoteAdviceSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3">
      {/* AI アドバイスヘッダー */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-3.5" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* 今回の接客振り返り */}
      <div className="space-y-3">
        <div className="border-b border-border pb-1">
          <Skeleton className="h-4 w-28" />
        </div>
        <AdviceSectionSkeleton />
        <AdviceSectionSkeleton />
      </div>

      {/* 次回の接客アドバイス */}
      <div className="space-y-3">
        <div className="border-b border-border pb-1">
          <Skeleton className="h-4 w-32" />
        </div>
        <AdviceSectionSkeleton />
        <AdviceSectionSkeleton />
        <AdviceSectionSkeleton />
        <AdviceSectionSkeleton />
        <AdviceSectionSkeleton />
      </div>
    </div>
  );
}

function CustomerNoteCardSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          {/* 日付: Calendar アイコン + テキスト */}
          <div className="flex gap-2 text-sm">
            <Skeleton className="size-4" />
            <Skeleton className="h-5 w-24" />
          </div>
          {/* 記入者: UserPen アイコン + テキスト */}
          <div className="flex gap-2 text-sm font-medium">
            <Skeleton className="size-4" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* 編集・削除ボタン */}
        <div className="flex gap-2">
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 本文 */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* 画像ギャラリー */}
        <div className="flex gap-2">
          <Skeleton className="size-[120px] rounded-lg" />
          <Skeleton className="size-[120px] rounded-lg" />
        </div>

        {/* AI アドバイス */}
        <CustomerNoteAdviceSkeleton />
      </CardContent>
    </Card>
  );
}

function SearchPaginationSkeleton(): React.JSX.Element {
  return (
    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
      <ul className="flex flex-row items-center gap-1">
        {/* 前へボタン */}
        <li>
          <Skeleton className="h-9 w-[70px]" />
        </li>
        {/* ページ番号 (3つ) */}
        <li>
          <Skeleton className="size-9" />
        </li>
        <li>
          <Skeleton className="size-9" />
        </li>
        <li>
          <Skeleton className="size-9" />
        </li>
        {/* 次へボタン */}
        <li>
          <Skeleton className="h-9 w-[70px]" />
        </li>
      </ul>
    </nav>
  );
}

export function CustomerNotesSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index}>
            <CustomerNoteCardSkeleton />
          </li>
        ))}
      </ul>

      <SearchPaginationSkeleton />
    </div>
  );
}
