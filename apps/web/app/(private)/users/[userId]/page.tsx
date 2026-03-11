import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { UserBasicInfoContainer } from "@/features/user/detail/user-basic-info.server";
import { UserBasicInfoSkeleton } from "@/features/user/detail/user-basic-info-skeleton.universal";

export default function Page({ params }: PageProps<"/users/[userId]">) {
	const userIdPromise = params.then(({ userId }) => userId);

	return (
		<Card className="p-4 w-full">
			<Suspense fallback={<UserBasicInfoSkeleton />}>
				<UserBasicInfoContainer userIdPromise={userIdPromise} />
			</Suspense>
		</Card>
	);
}
