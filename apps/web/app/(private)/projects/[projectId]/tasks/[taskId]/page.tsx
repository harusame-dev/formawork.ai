import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { TaskDetailContainer } from "@/features/task/detail/task-detail.server";
import { TaskDetailSkeleton } from "@/features/task/detail/task-detail-skeleton.universal";

export default function Page({
	params,
}: PageProps<"/projects/[projectId]/tasks/[taskId]">) {
	const taskIdPromise = params.then(({ taskId }) => taskId);

	return (
		<Card className="p-4">
			<Suspense fallback={<TaskDetailSkeleton />}>
				<TaskDetailContainer taskIdPromise={taskIdPromise} />
			</Suspense>
		</Card>
	);
}
