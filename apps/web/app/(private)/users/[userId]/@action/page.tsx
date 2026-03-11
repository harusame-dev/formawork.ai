import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { DeleteUserDialog } from "@/features/user/delete/delete-user-dialog.client";

export default function Page({ params }: PageProps<"/users/[userId]">) {
	const userIdPromise = params.then(({ userId }) => userId);

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
			<Action userIdPromise={userIdPromise} />
		</Suspense>
	);
}

async function Action({ userIdPromise }: { userIdPromise: Promise<string> }) {
	const [userId, userRole, currentUserId] = await Promise.all([
		userIdPromise,
		getUserRole(),
		getUserStaffId(),
	]);

	if (userRole !== UserRole.Admin) {
		return null;
	}

	const isSelf = userId === currentUserId;

	return (
		<div className="flex items-center gap-4">
			<Link className="underline" href={`/users/${userId}/edit`}>
				編集
			</Link>
			{!isSelf && <DeleteUserDialog userId={userId} />}
		</div>
	);
}
