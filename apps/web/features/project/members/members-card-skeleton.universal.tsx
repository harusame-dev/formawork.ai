import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function MembersCardSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">メンバー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div className="flex items-center justify-between" key={index}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
