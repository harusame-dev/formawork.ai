import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTaskDetail } from "@/features/task/detail/get-task-detail";
import { TaskActionButtons } from "@/features/task/detail/task-action-buttons.client";
import { EditTaskFormContainer } from "@/features/task/edit/edit-task-form.server";

export default function Page({
	params,
}: PageProps<"/projects/[projectId]/tasks/[taskId]">) {
	const projectIdPromise = params.then(({ projectId }) => projectId);
	const taskIdPromise = params.then(({ taskId }) => taskId);

	return (
		<Suspense
			fallback={
				<div aria-busy className="flex items-center gap-4">
					<span className="sr-only">操作読み込み中</span>
					<Skeleton aria-hidden className="h-4 w-8 bg-black/10" />
					<Button aria-hidden disabled size="sm" variant="destructive">
						削除
					</Button>
				</div>
			}
		>
			<Action
				projectIdPromise={projectIdPromise}
				taskIdPromise={taskIdPromise}
			/>
		</Suspense>
	);
}

async function Action({
	projectIdPromise,
	taskIdPromise,
}: {
	projectIdPromise: Promise<string>;
	taskIdPromise: Promise<string>;
}) {
	const [projectId, taskId] = await Promise.all([
		projectIdPromise,
		taskIdPromise,
	]);
	const task = await getTaskDetail(taskId);

	if (!task) {
		notFound();
	}

	return (
		<div className="flex items-center gap-4">
			<Suspense>
				<EditTaskFormContainer task={task} />
			</Suspense>
			<TaskActionButtons projectId={projectId} taskId={taskId} />
		</div>
	);
}
