import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { GlossaryTableSkeleton } from "@/features/glossary/glossary-table-skeleton.universal";

export function ProjectGlossarySkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="text-primary underline">プロジェクト</span>
        <span>/</span>
        <Skeleton className="h-4 w-32" />
        <span>/ 用語集</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-bold">用語集</h1>
          <p className="text-sm text-muted-foreground">
            このプロジェクト固有の用語集です。共通用語集と合わせて AI 英訳の
            ヒントに使われます。
          </p>
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <Card className="p-4">
        <GlossaryTableSkeleton />
      </Card>
    </div>
  );
}
