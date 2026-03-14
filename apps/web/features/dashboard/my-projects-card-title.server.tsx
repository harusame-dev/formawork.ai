import Link from "next/link";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

export async function MyProjectsCardTitle() {
	const staffId = await getUserStaffId();

	return (
		<Link
			className="hover:underline"
			href={staffId ? `/projects?assigneeId=${staffId}` : "/projects"}
		>
			担当プロジェクト
		</Link>
	);
}
