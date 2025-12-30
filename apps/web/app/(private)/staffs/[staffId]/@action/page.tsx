import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
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
				<div aria-busy className="flex items-center gap-4">
					<span className="sr-only">操作読み込み中</span>
					<Skeleton aria-hidden className="h-4 w-8 bg-black/10" />
					<Button aria-hidden disabled size="sm">
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
		<div className="flex items-center gap-4">
			<Link className="underline" href={`/staffs/${staffId}/edit`}>
				編集
			</Link>
			{!isSelf && <DeleteStaffDialog staffId={staffId} />}
		</div>
	);
}
