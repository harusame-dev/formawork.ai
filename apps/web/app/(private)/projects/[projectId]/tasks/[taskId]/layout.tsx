import type { ReactNode } from "react";
import { Suspense } from "react";
import { TaskInfoContainer } from "@/features/task/detail/task-info.server";
import { TaskInfoSkeleton } from "@/features/task/detail/task-info-skeleton.universal";

type TaskDetailLayoutProps =
	LayoutProps<"/projects/[projectId]/tasks/[taskId]"> & {
		action: ReactNode;
	};

export default function TaskDetailLayout({
	params,
	children,
	action,
}: TaskDetailLayoutProps) {
	const taskIdPromise = params.then(({ taskId }) => taskId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<Suspense fallback={<TaskInfoSkeleton />}>
					<TaskInfoContainer taskIdPromise={taskIdPromise} />
				</Suspense>
				{action}
			</div>

			{children}
		</div>
	);
}
