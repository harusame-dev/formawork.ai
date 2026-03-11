import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { UserEditFormContainer } from "@/features/user/edit/user-edit-form.server";
import { UserEditFormSkeleton } from "@/features/user/edit/user-edit-form-skeleton.universal";

export default function Page({ params }: PageProps<"/users/[userId]/edit">) {
	const userIdPromise = params.then(({ userId }) => userId);

	return (
		<Card className="w-full p-4">
			<Suspense fallback={<UserEditFormSkeleton />}>
				<UserEditFormContainer userIdPromise={userIdPromise} />
			</Suspense>
		</Card>
	);
}
