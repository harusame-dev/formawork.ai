import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { StaffBasicInfoContainer } from "@/features/staff/detail/staff-basic-info.server";
import { StaffBasicInfoSkeleton } from "@/features/staff/detail/staff-basic-info-skeleton.universal";

export default function Page({
  params,
}: PageProps<"/staffs/[staffId]">): React.JSX.Element {
  const staffIdPromise = params.then(({ staffId }) => staffId);

  return (
    <Card className="w-full p-4">
      <Suspense fallback={<StaffBasicInfoSkeleton />}>
        <StaffBasicInfoContainer staffIdPromise={staffIdPromise} />
      </Suspense>
    </Card>
  );
}
