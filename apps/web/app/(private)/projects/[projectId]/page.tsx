import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectBasicInfoContainer } from "@/features/project/detail/project-basic-info.server";
import { ProjectBasicInfoSkeleton } from "@/features/project/detail/project-basic-info-skeleton.universal";
import { TasksContainer } from "@/features/task/list/tasks.server";

export default function Page({ params }: PageProps<"/projects/[projectId]">) {
	const projectIdPromise = params.then(({ projectId }) => projectId);

	return (
		<div className="space-y-4">
			<Card className="p-4">
				<Suspense fallback={<ProjectBasicInfoSkeleton />}>
					<ProjectBasicInfoContainer projectIdPromise={projectIdPromise} />
				</Suspense>
			</Card>

			<Card className="p-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-bold">タスク</h2>
					<Suspense>
						<TasksHeader projectIdPromise={projectIdPromise} />
					</Suspense>
				</div>
				<Suspense fallback={<div className="sr-only">読み込み中</div>}>
					<TasksSection projectIdPromise={projectIdPromise} />
				</Suspense>
			</Card>
		</div>
	);
}

async function TasksHeader({
	projectIdPromise,
}: {
	projectIdPromise: Promise<string>;
}) {
	const projectId = await projectIdPromise;
	return (
		<Button asChild size="sm">
			<Link href={`/tasks/new?projectId=${projectId}`}>
				<Plus className="h-4 w-4 mr-1" />
				タスクを追加
			</Link>
		</Button>
	);
}

async function TasksSection({
	projectIdPromise,
}: {
	projectIdPromise: Promise<string>;
}) {
	const projectId = await projectIdPromise;
	return <TasksContainer projectId={projectId} />;
}
