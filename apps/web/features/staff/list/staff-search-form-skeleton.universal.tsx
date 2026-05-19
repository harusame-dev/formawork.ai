import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffSearchFormSkeleton(): React.JSX.Element {
  return (
    <div aria-busy="true">
      <div className="sr-only">読み込み中</div>
      <form>
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
      </form>
    </div>
  );
}
