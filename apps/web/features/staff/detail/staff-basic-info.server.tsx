import type React from "react";
import { notFound } from "next/navigation";
import { getStaffDetail } from "./get-staff-detail";
import { StaffBasicInfoPresenter } from "./staff-basic-info.universal";

interface StaffBasicInfoContainerProps {
  staffIdPromise: Promise<string>;
}

export async function StaffBasicInfoContainer({
  staffIdPromise,
}: StaffBasicInfoContainerProps): Promise<React.JSX.Element> {
  const staffId = await staffIdPromise;
  const staff = await getStaffDetail(staffId);

  if (!staff) {
    notFound();
  }

  return <StaffBasicInfoPresenter staff={staff} />;
}
