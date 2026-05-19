import type React from "react";
import {
  MEMORY_CATEGORY_LABEL,
  type MemoryCategory,
  type SelectCustomerMemory,
} from "@workspace/db/schema/customer-memory";
import { Card, CardContent } from "@workspace/ui/components/card";
import { MAX_MEMORIES } from "@/features/customer-memory/customer-memory";
import { CustomerMemoryActionButtons } from "./customer-memory-action-buttons.client";

interface CustomerMemoriesPresenterProps {
  customerId: string;
  memories: SelectCustomerMemory[];
}

export function CustomerMemoriesPresenter({
  customerId,
  memories,
}: CustomerMemoriesPresenterProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="pt-6">
        <table aria-label="顧客メモリ一覧" className="w-full">
          <caption className="sr-only">
            顧客のメモリ情報を番号、カテゴリ、内容、重要度の順で表示しています
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
            {Array.from({ length: MAX_MEMORIES }, (_, index) => {
              const memory = memories[index];
              const category = memory
                ? MEMORY_CATEGORY_LABEL[memory.category as MemoryCategory]
                : "-";
              const content = memory?.content ?? "-";
              const importance = memory?.importance ?? "-";

              return (
                <tr
                  className="flex min-h-14 flex-wrap border-b py-2 last:border-b-0 sm:table-row sm:min-h-0 sm:py-0"
                  key={memory?.id ?? `empty-${index}`}
                >
                  <td className="text-sm text-muted-foreground sm:table-cell sm:w-12 sm:p-2">
                    <span aria-hidden="true" className="sm:hidden">
                      #
                    </span>
                    {index + 1}
                  </td>
                  <td className="ml-2 text-sm sm:ml-0 sm:table-cell sm:p-2">
                    {category}
                  </td>
                  <td
                    aria-label={`重要度: ${importance}`}
                    className="ml-auto text-sm text-muted-foreground sm:hidden"
                  >
                    重要度:
                    <span className="ml-1 inline-block w-3">{importance}</span>
                  </td>
                  <td className="mt-1 w-full pl-6 text-sm break-all text-muted-foreground sm:mt-0 sm:table-cell sm:w-auto sm:p-2 sm:pl-2 sm:text-foreground">
                    {content}
                  </td>
                  <td className="hidden text-center text-sm sm:table-cell sm:w-16 sm:p-2">
                    {importance}
                  </td>
                  <td className="ml-auto text-center sm:ml-0 sm:table-cell sm:w-28 sm:p-2">
                    {memory && (
                      <CustomerMemoryActionButtons
                        customerId={customerId}
                        memory={memory}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
