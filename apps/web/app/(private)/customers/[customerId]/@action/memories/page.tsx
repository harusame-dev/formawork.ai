import type React from "react";
import { Button } from "@workspace/ui/components/button";
import { Suspense } from "react";
import { RegisterCustomerMemoryDialogContainer } from "@/features/customer-memory/register/register-customer-memory-dialog.server";

export default async function CustomerMemoriesActionPage({
  params,
}: PageProps<"/customers/[customerId]/memories">): Promise<React.JSX.Element> {
  const customerIdPromise = params.then(({ customerId }) => customerId);

  return (
    <Suspense
      fallback={
        <Button disabled size="sm">
          メモリを追加
        </Button>
      }
    >
      <RegisterCustomerMemoryDialogContainer customerId={customerIdPromise} />
    </Suspense>
  );
}
