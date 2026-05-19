import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { CustomerSearchFormContainer } from "@/features/customer/list/customer-search-form.server";
import { CustomerSearchFormSkeleton } from "@/features/customer/list/customer-search-form-skeleton.universal";
import { CustomersContainer } from "@/features/customer/list/customers.server";
import { CustomersSkeleton } from "@/features/customer/list/customers-skeleton.universal";
import { parseCustomersConditionSearchParams } from "@/features/customer/list/schema";
import { OnboardingId } from "@/features/onboarding/constants/steps.universal";
import { SuspenseOnSearch } from "@/libs/suspense-on-search.client";

export default function Page({
  searchParams,
}: PageProps<"/customers">): React.JSX.Element {
  const validatedCondition = searchParams.then(
    (parameters) => parseCustomersConditionSearchParams(parameters).data,
  );

  return (
    <div className="container mx-auto space-y-4 p-2">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">顧客一覧</h1>
        <Suspense fallback={<Skeleton className="h-4 w-16 bg-black/10" />}>
          <RegisterLink />
        </Suspense>
      </div>
      <Card className="w-full p-4" id={OnboardingId.SearchForm}>
        <SuspenseOnSearch fallback={<CustomerSearchFormSkeleton />}>
          <CustomerSearchFormContainer conditionPromise={validatedCondition} />
        </SuspenseOnSearch>
      </Card>
      <Card className="w-full py-2">
        <SuspenseOnSearch fallback={<CustomersSkeleton />}>
          <CustomersContainer condition={validatedCondition} />
        </SuspenseOnSearch>
      </Card>
    </div>
  );
}

async function RegisterLink(): Promise<React.JSX.Element | null> {
  const userRole = await getUserRole();
  if (userRole !== UserRole.Admin) {
    return null;
  }

  return (
    <Link className="text-primary underline" href="/customers/new">
      新規登録
    </Link>
  );
}
