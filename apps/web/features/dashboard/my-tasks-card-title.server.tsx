import Link from "next/link";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

export async function MyTasksCardTitle() {
	const staffId = await getUserStaffId();

	return (
		<Link
			className="hover:underline"
			href={
				staffId
					? `/tasks?assigneeIds=${staffId}&statuses=todo&statuses=in_progress`
					: "/tasks"
			}
		>
			担当タスク
		</Link>
	);
}
