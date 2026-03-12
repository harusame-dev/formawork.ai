import Link from "next/link";
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
	const projectIdPromise = params.then(({ projectId }) => projectId);
	const taskIdPromise = params.then(({ taskId }) => taskId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div>
				<Suspense>
					<BackLink projectIdPromise={projectIdPromise} />
				</Suspense>
			</div>
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

async function BackLink({
	projectIdPromise,
}: {
	projectIdPromise: Promise<string>;
}) {
	const projectId = await projectIdPromise;
	return (
		<Link
			className="text-sm text-muted-foreground underline"
			href={`/projects/${projectId}`}
		>
			← 案件詳細に戻る
		</Link>
	);
}
