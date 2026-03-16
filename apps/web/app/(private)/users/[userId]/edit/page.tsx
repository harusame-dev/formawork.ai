import { Suspense } from "react";
import { UserEditFormContainer } from "@/features/user/edit/user-edit-form.server";
import { UserEditFormSkeleton } from "@/features/user/edit/user-edit-form-skeleton.universal";

export default function Page({ params }: PageProps<"/users/[userId]/edit">) {
	const userIdPromise = params.then(({ userId }) => userId);

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h1 className="text-xl font-bold">ユーザー編集</h1>
			</div>
			<div className="px-6 pb-6">
				<Suspense fallback={<UserEditFormSkeleton />}>
					<UserEditFormContainer userIdPromise={userIdPromise} />
				</Suspense>
			</div>
		</div>
	);
}
