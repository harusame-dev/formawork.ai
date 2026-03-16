import { Suspense } from "react";
import { UserBasicInfoContainer } from "@/features/user/detail/user-basic-info.server";
import { UserBasicInfoSkeleton } from "@/features/user/detail/user-basic-info-skeleton.universal";

export default function Page({ params }: PageProps<"/users/[userId]">) {
	const userIdPromise = params.then(({ userId }) => userId);

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h1 className="text-xl font-bold">ユーザー詳細</h1>
			</div>
			<div className="px-6 pb-6">
				<Suspense fallback={<UserBasicInfoSkeleton />}>
					<UserBasicInfoContainer userIdPromise={userIdPromise} />
				</Suspense>
			</div>
		</div>
	);
}
