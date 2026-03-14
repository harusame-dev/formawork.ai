import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { ProjectEditFormSkeleton } from "@/features/project/edit/project-edit-form-skeleton.universal";
import { RegisterProjectFormContainer } from "@/features/project/register/project-form.server";

export default function Page() {
	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">新規プロジェクト登録</h1>
			<Card className="p-4">
				<Suspense fallback={<ProjectEditFormSkeleton />}>
					<RegisterProjectFormContainer />
				</Suspense>
			</Card>
		</div>
	);
}
