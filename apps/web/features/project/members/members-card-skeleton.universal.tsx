import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function MembersCardSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <Card className="space-y-3 p-4">
        {[0, 1, 2].map((index) => (
          <div className="flex items-center justify-between" key={index}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </Card>
    </div>
  );
}
