import type React from "react";
import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import { OnboardingId } from "@/features/onboarding/constants/steps.universal";
import type { CustomersListItem } from "./schema";

interface CustomersPresenterProps {
  customers: CustomersListItem[];
  page: number;
  totalPages: number;
}

export function CustomersPresenter({
  customers,
  page,
  totalPages,
}: CustomersPresenterProps): React.JSX.Element {
  if (customers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="py-8 text-center text-muted-foreground">
          顧客が見つかりませんでした
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption className="sr-only"> 顧客検索結果</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>メールアドレス</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => (
            <TableRow key={customer.customerId}>
              <TableCell>
                <Link
                  className="break-all text-primary underline"
                  href={`/customers/${customer.customerId}`}
                  id={index === 0 ? OnboardingId.FirstCustomer : undefined}
                >
                  {customer.lastName} {customer.firstName}
                </Link>
              </TableCell>
              <TableCell className="break-all">{customer.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SearchPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
