import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function WorksSkeleton(): React.JSX.Element {
  return (
    <div className="divide-y">
      {[0, 1, 2].map((index) => (
        <div
          className="flex items-center justify-between gap-3 px-2 py-3"
          key={index}
        >
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
