import { notFound } from "next/navigation";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getStaffDetail } from "@/features/staff/detail/get-staff-detail";
import { EditStaffForm } from "@/features/staff/register/edit-staff-form.client";

interface StaffEditFormContainerProps {
  staffIdPromise: Promise<string>;
}

export async function StaffEditFormContainer({
  staffIdPromise,
}: StaffEditFormContainerProps): Promise<JSX.Element> {
  const staffId = await staffIdPromise;
  const [staff, currentUserStaffId] = await Promise.all([
    getStaffDetail(staffId),
    getUserStaffId(),
  ]);

  if (!staff) {
    notFound();
  }

  const isSelf = staffId === currentUserStaffId;

  return (
    <EditStaffForm
      authUserId={staff.authUserId || ""}
      disabled={false}
      initialValues={{
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
      }}
      isSelf={isSelf}
      staffId={staffId}
    />
  );
}
