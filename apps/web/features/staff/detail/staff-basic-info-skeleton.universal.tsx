import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffBasicInfoSkeleton(): React.JSX.Element {
  return (
    <table className="w-full">
      <tbody className="space-y-4 [&>tr]:block">
        <tr>
          <th className="flex h-lh items-end">
            <Skeleton className="h-4 w-28" />
          </th>
          <td className="flex h-lh items-end">
            <Skeleton className="h-4 w-48" />
          </td>
        </tr>
        <tr>
          <th className="flex h-lh items-end">
            <Skeleton className="h-4 w-12" />
          </th>
          <td className="flex h-lh items-end">
            <Skeleton className="h-4 w-40" />
          </td>
        </tr>
        <tr>
          <th className="flex h-lh items-end">
            <Skeleton className="h-4 w-12" />
          </th>
          <td className="flex h-lh items-end">
            <Skeleton className="h-4 w-40" />
          </td>
        </tr>
        <tr>
          <th className="flex h-lh items-end">
            <Skeleton className="h-4 w-12" />
          </th>
          <td className="flex h-lh items-end">
            <Skeleton className="h-4 w-40" />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
