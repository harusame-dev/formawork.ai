import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getStaffDetail } from "@/features/staff/detail/get-staff-detail";
import { EditStaffForm } from "@/features/staff/register/edit-staff-form";

type StaffEditFormContainerProps = {
	staffIdPromise: Promise<string>;
};

export async function StaffEditFormContainer({
	staffIdPromise,
}: StaffEditFormContainerProps) {
	const staffId = await staffIdPromise;
	const [staff, currentUserStaffId, staffRecord] = await Promise.all([
		getStaffDetail(staffId),
		getUserStaffId(),
		db.query.staffsTable.findFirst({
			where: eq(staffsTable.staffId, staffId),
		}),
	]);

	if (!staff || !staffRecord) {
		notFound();
	}

	const isSelf = staffId === currentUserStaffId;

	return (
		<EditStaffForm
			authUserId={staffRecord.authUserId || ""}
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
