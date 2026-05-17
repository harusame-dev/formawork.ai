import { Suspense } from "react";
import { UserRegisterFormContainer } from "@/features/user/register/user-form.server";
import { UserFormSkeleton } from "@/features/user/register/user-form-skeleton.universal";

export default function Page() {
	return (
		<div className="container mx-auto p-4 flex flex-col gap-4 max-w-3xl">
			<h1 className="text-xl font-semibold">ユーザーを登録</h1>
			<Suspense fallback={<UserFormSkeleton />}>
				<UserRegisterFormContainer />
			</Suspense>
		</div>
	);
}
