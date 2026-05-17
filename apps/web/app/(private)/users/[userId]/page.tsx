import { Skeleton } from "@workspace/ui/components/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { getUserDetail } from "@/features/user/detail/get-user-detail";
import { UserActions } from "@/features/user/detail/user-actions.client";
import { UserInfoContainer } from "@/features/user/detail/user-info.server";
import { UserInfoSkeleton } from "@/features/user/detail/user-info-skeleton.universal";

export default function Page({ params }: PageProps<"/users/[userId]">) {
	const userIdPromise = params.then((p) => p.userId);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4 max-w-3xl">
			<Suspense
				fallback={
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-semibold">ユーザー詳細</h1>
						<Skeleton className="h-9 w-48" />
					</div>
				}
			>
				<UserHeader userIdPromise={userIdPromise} />
			</Suspense>
			<Suspense fallback={<UserInfoSkeleton />}>
				<UserInfoWrapper userIdPromise={userIdPromise} />
			</Suspense>
		</div>
	);
}

async function UserHeader({
	userIdPromise,
}: {
	userIdPromise: Promise<string>;
}) {
	await requireRole([UserRole.Admin]);
	const userId = await userIdPromise;
	const user = await getUserDetail(userId);
	if (!user) {
		notFound();
	}
	return (
		<div className="flex items-center justify-between">
			<h1 className="text-xl font-semibold">ユーザー詳細</h1>
			<UserActions userEmail={user.email} userId={userId} />
		</div>
	);
}

async function UserInfoWrapper({
	userIdPromise,
}: {
	userIdPromise: Promise<string>;
}) {
	const userId = await userIdPromise;
	return <UserInfoContainer userId={userId} />;
}
