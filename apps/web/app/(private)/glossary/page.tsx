import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CommonGlossaryHeader } from "@/features/glossary/common/common-glossary-header.server";
import { CommonGlossaryContainer } from "@/features/glossary/common/common-glossary.server";
import { GlossaryTableSkeleton } from "@/features/glossary/glossary-table-skeleton.universal";

export default function Page(): React.JSX.Element {
  return (
    <div className="container mx-auto max-w-5xl space-y-4 p-4">
      <div>
        <h1 className="font-bold">共通用語集</h1>
        <p className="text-sm text-muted-foreground">
          全プロジェクトで共通利用する用語集です。各プロジェクト固有の用語集と
          合わせて AI 英訳のヒントに使われます。
        </p>
      </div>
      <CommonGlossaryHeader />
      <Card className="p-4">
        <Suspense fallback={<GlossaryTableSkeleton />}>
          <CommonGlossaryContainer />
        </Suspense>
      </Card>
    </div>
  );
}
