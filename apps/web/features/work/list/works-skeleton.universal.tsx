import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function WorksSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((index) => (
        <div className="flex items-center gap-4" key={index}>
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
