import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { TranslationMemoryContainer } from "@/features/translation-memory/list/translation-memory.server";
import { TranslationMemorySkeleton } from "@/features/translation-memory/list/translation-memory-skeleton.universal";

export default function Page(): React.JSX.Element {
  return (
    <div className="container mx-auto max-w-5xl space-y-4 p-4">
      <div>
        <h1 className="font-bold">翻訳メモリ</h1>
        <p className="text-sm text-muted-foreground">
          確定済みの対訳を横断検索します。AI 英訳時には類似度の高い過去訳を
          上位5件まで自動参照します。
        </p>
      </div>
      <Card className="p-4">
        <Suspense fallback={<TranslationMemorySkeleton />}>
          <TranslationMemoryContainer />
        </Suspense>
      </Card>
    </div>
  );
}
