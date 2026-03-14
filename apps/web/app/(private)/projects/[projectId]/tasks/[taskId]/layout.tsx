import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { getProjectDetail } from "@/features/project/detail/get-project-detail";
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
					<ProjectTitleLink projectIdPromise={projectIdPromise} />
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

async function ProjectTitleLink({
	projectIdPromise,
}: {
	projectIdPromise: Promise<string>;
}) {
	const projectId = await projectIdPromise;
	const project = await getProjectDetail(projectId);
	if (!project) return null;
	return (
		<Link
			className="text-sm text-muted-foreground hover:underline"
			href={`/projects/${projectId}`}
		>
			{project.name}
		</Link>
	);
}
