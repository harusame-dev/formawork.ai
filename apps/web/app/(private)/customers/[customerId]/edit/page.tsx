import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CustomerEditFormContainer } from "@/features/customer/edit/customer-edit-form.server";
import { CustomerEditFormSkeleton } from "@/features/customer/edit/customer-edit-form-skeleton.universal";

export default function Page({
  params,
}: PageProps<"/customers/[customerId]/edit">): React.JSX.Element {
  const customerIdPromise = params.then(({ customerId }) => customerId);

  return (
    <div className="container mx-auto space-y-4 p-2">
      <h1 className="font-bold">顧客情報の編集</h1>
      <Card className="w-full p-4">
        <Suspense fallback={<CustomerEditFormSkeleton />}>
          <CustomerEditFormContainer customerIdPromise={customerIdPromise} />
        </Suspense>
      </Card>
    </div>
  );
}
