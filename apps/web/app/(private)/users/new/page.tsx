import { Suspense } from "react";
import { EditUserForm } from "@/features/user/register/edit-user-form.client";

export default function NewUserPage() {
	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h1 className="text-xl font-bold">ユーザー登録</h1>
			</div>
			<div className="px-6 pb-6">
				<Suspense>
					<EditUserForm />
				</Suspense>
			</div>
		</div>
	);
}
