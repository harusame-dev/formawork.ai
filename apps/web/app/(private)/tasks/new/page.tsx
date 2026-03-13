import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { RegisterTaskPageFormContainer } from "@/features/task/register/register-task-page-form.server";
import { RegisterTaskPageFormSkeleton } from "@/features/task/register/register-task-page-form-skeleton.universal";

export default function Page() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">新規タスク登録</h1>
			<Card className="p-4">
				<Suspense fallback={<RegisterTaskPageFormSkeleton />}>
					<RegisterTaskPageFormContainer />
				</Suspense>
			</Card>
		</div>
	);
}
