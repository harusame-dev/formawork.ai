import { Card } from "@workspace/ui/components/card";
import { EditUserForm } from "@/features/user/register/edit-user-form.client";

export default function NewUserPage() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">新規ユーザー登録</h1>
			<Card className="p-4 w-full">
				<EditUserForm />
			</Card>
		</div>
	);
}
