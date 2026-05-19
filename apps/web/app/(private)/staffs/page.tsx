import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { RegisterStaffLink } from "@/features/staff/list/register-staff-link.server";
import { parseStaffsConditionSearchParams } from "@/features/staff/list/schema";
import { StaffSearchFormContainer } from "@/features/staff/list/staff-search-form.server";
import { StaffSearchFormSkeleton } from "@/features/staff/list/staff-search-form-skeleton.universal";
import { StaffsContainer } from "@/features/staff/list/staffs.server";
import { StaffsSkeleton } from "@/features/staff/list/staffs-skeleton.universal";
import { SuspenseOnSearch } from "@/libs/suspense-on-search.client";

export default async function Page({
  searchParams,
}: PageProps<"/staffs">): Promise<React.JSX.Element> {
  const validatedCondition = searchParams.then(
    (parameters) => parseStaffsConditionSearchParams(parameters).data,
  );

  return (
    <div className="container mx-auto space-y-4 p-2">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">スタッフ一覧</h1>
        <Suspense fallback={<Skeleton className="h-5 w-16" />}>
          <RegisterStaffLink />
        </Suspense>
      </div>
      <Card className="w-full p-4">
        <SuspenseOnSearch fallback={<StaffSearchFormSkeleton />}>
          <StaffSearchFormContainer conditionPromise={validatedCondition} />
        </SuspenseOnSearch>
      </Card>
      <Card className="w-full py-2">
        <SuspenseOnSearch fallback={<StaffsSkeleton />}>
          <StaffsContainer condition={validatedCondition} />
        </SuspenseOnSearch>
      </Card>
    </div>
  );
}
