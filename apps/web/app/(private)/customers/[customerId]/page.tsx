import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CustomerBasicInfoContainer } from "@/features/customer/detail/customer-basic-info.server";
import { CustomerBasicInfoSkeleton } from "@/features/customer/detail/customer-basic-info-skeleton.universal";

export default function Page({
  params,
}: PageProps<"/customers/[customerId]">): React.JSX.Element {
  const customerIdPromise = params.then(({ customerId }) => customerId);

  return (
    <Card className="w-full p-4">
      <Suspense fallback={<CustomerBasicInfoSkeleton />}>
        <CustomerBasicInfoContainer customerIdPromise={customerIdPromise} />
      </Suspense>
    </Card>
  );
}
