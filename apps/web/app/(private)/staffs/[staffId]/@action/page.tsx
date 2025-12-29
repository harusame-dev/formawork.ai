import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Suspense } from "react";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { DeleteStaffDialog } from "@/features/staff/delete/delete-staff-dialog";

export default function Page({ params }: PageProps<"/staffs/[staffId]">) {
	const staffIdPromise = params.then(({ staffId }) => staffId);

	return (
		<Suspense
			fallback={
				<div className="flex gap-2">
					<Button asChild disabled size="sm" variant="outline">
						<span>編集</span>
					</Button>
					<Button disabled size="sm" variant="destructive">
						削除
					</Button>
				</div>
			}
		>
			<Action staffIdPromise={staffIdPromise} />
		</Suspense>
	);
}

async function Action({ staffIdPromise }: { staffIdPromise: Promise<string> }) {
	const [staffId, userRole, currentUserStaffId] = await Promise.all([
		staffIdPromise,
		getUserRole(),
		getUserStaffId(),
	]);

	if (userRole !== UserRole.Admin) {
		return null;
	}

	const isSelf = staffId === currentUserStaffId;

	return (
		<div className="flex gap-2">
			<Button asChild size="sm" variant="outline">
				<Link href={`/staffs/${staffId}/edit`}>編集</Link>
			</Button>
			{!isSelf && <DeleteStaffDialog staffId={staffId} />}
		</div>
	);
}
