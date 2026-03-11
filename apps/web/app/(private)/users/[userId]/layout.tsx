import type { ReactNode } from "react";
import { Suspense } from "react";
import { UserInfoContainer } from "@/features/user/detail/user-info.server";
import { UserInfoSkeleton } from "@/features/user/detail/user-info-skeleton.universal";

type UserDetailLayoutProps = LayoutProps<"/users/[userId]"> & {
	action: ReactNode;
};

export default async function UserDetailLayout({
	params,
	children,
	action,
}: UserDetailLayoutProps) {
	const userIdPromise = params.then(({ userId }) => userId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<Suspense fallback={<UserInfoSkeleton />}>
					<UserInfoContainer userIdPromise={userIdPromise} />
				</Suspense>
				{action}
			</div>

			{children}
		</div>
	);
}
