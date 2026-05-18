import type { ReactNode } from "react";
import { Suspense } from "react";
import { CustomerDetailTabs } from "@/features/customer/detail/customer-detail-tabs.client";
import { CustomerDetailTabsSkeleton } from "@/features/customer/detail/customer-detail-tabs-skeleton.universal";
import { CustomerInfoContainer } from "@/features/customer/detail/customer-info.server";
import { CustomerInfoSkeleton } from "@/features/customer/detail/customer-info-skeleton.universal";

type CustomerDetailLayoutProps = LayoutProps<"/customers/[customerId]"> & {
  action: ReactNode;
};

export default async function CustomerDetailLayout({
  params,
  children,
  action,
}: CustomerDetailLayoutProps): Promise<JSX.Element> {
  const customerIdPromise = params.then(({ customerId }) => customerId);

  return (
    <div className="container mx-auto space-y-4 p-2">
      <div className="flex items-center justify-between">
        <Suspense fallback={<CustomerInfoSkeleton />}>
          <CustomerInfoContainer customerIdPromise={customerIdPromise} />
        </Suspense>
        {action}
      </div>

      <Suspense fallback={<CustomerDetailTabsSkeleton />}>
        <CustomerDetailTabs customerIdPromise={customerIdPromise} />
      </Suspense>

      {children}
    </div>
  );
}
