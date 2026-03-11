import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { ProjectEditFormContainer } from "@/features/project/edit/project-edit-form.server";
import { ProjectEditFormSkeleton } from "@/features/project/edit/project-edit-form-skeleton.universal";

export default function Page({
	params,
}: PageProps<"/projects/[projectId]/edit">) {
	const projectIdPromise = params.then(({ projectId }) => projectId);

	return (
		<Card className="p-4">
			<Suspense fallback={<ProjectEditFormSkeleton />}>
				<ProjectEditFormContainer projectIdPromise={projectIdPromise} />
			</Suspense>
		</Card>
	);
}
