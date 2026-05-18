import { notFound } from "next/navigation";
import { getStaffDetail } from "./get-staff-detail";
import { StaffInfoPresenter } from "./staff-info.universal";

interface StaffInfoContainerProps {
  staffIdPromise: Promise<string>;
}

export async function StaffInfoContainer({
  staffIdPromise,
}: StaffInfoContainerProps): Promise<JSX.Element> {
  const staff = await getStaffDetail(await staffIdPromise);

  if (!staff) {
    notFound();
  }

  return (
    <StaffInfoPresenter firstName={staff.firstName} lastName={staff.lastName} />
  );
}
