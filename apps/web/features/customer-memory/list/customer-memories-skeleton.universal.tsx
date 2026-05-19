import type React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { MAX_MEMORIES } from "@/features/customer-memory/customer-memory";

export function CustomerMemoriesSkeleton(): React.JSX.Element {
  return (
    <Card>
      <CardContent className="pt-6">
        <table aria-label="顧客メモリ一覧 読み込み中" className="w-full">
          <caption className="sr-only">
            顧客のメモリ情報を読み込み中です
          </caption>
          <thead className="hidden sm:table-header-group">
            <tr className="border-b text-sm font-medium text-muted-foreground">
              <th className="w-12 p-2 text-left" scope="col">
                #
              </th>
              <th className="p-2 text-left" scope="col">
                カテゴリ
              </th>
              <th className="p-2 text-left" scope="col">
                内容
              </th>
              <th className="w-16 p-2 text-center" scope="col">
                重要度
              </th>
              <th className="w-28 p-2 text-center" scope="col">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: MAX_MEMORIES }).map((_, index) => (
              <tr
                className="flex min-h-14 flex-wrap border-b py-2 last:border-b-0 sm:table-row sm:min-h-0 sm:py-0"
                key={index}
              >
                <td className="text-sm text-muted-foreground sm:table-cell sm:w-12 sm:p-2">
                  <span aria-hidden="true" className="sm:hidden">
                    #
                  </span>
                  {index + 1}
                </td>
                <td className="ml-2 text-sm sm:ml-0 sm:table-cell sm:p-2">
                  <Skeleton className="inline-block h-3.5 w-28 align-middle" />
                </td>
                <td
                  aria-label="重要度: 読み込み中"
                  className="ml-auto text-sm text-muted-foreground sm:hidden"
                >
                  重要度:
                  <Skeleton className="ml-1 inline-block h-3.5 w-3 align-middle" />
                </td>
                <td className="mt-1 w-full pl-6 text-sm text-muted-foreground sm:mt-0 sm:table-cell sm:w-auto sm:p-2 sm:pl-2 sm:text-foreground">
                  <Skeleton className="mt-1 h-4 w-full" />
                </td>
                <td className="hidden text-center text-sm sm:table-cell sm:w-16 sm:p-2">
                  <Skeleton className="mx-auto mt-1 h-4 w-6" />
                </td>
                <td className="ml-auto text-center sm:ml-0 sm:table-cell sm:w-28 sm:p-2">
                  <Skeleton className="mx-auto h-8 w-16 rounded-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
