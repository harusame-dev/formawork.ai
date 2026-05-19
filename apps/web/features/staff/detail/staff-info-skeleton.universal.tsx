import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffInfoSkeleton(): React.JSX.Element {
  return <Skeleton className="h-8 w-48 bg-black/10" />;
}
