import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { ArchiveProjectButton } from "@/features/project/archive/archive-project-button.client";
import { DeleteProjectDialog } from "@/features/project/delete/delete-project-dialog.client";
import { getProjectDetail } from "@/features/project/detail/get-project-detail";

export default function Page({ params }: PageProps<"/projects/[projectId]">) {
	const projectIdPromise = params.then(({ projectId }) => projectId);

	return (
		<Suspense
			fallback={
				<div aria-busy className="flex items-center justify-between">
					<span className="sr-only">操作読み込み中</span>
					<Skeleton aria-hidden className="h-8 w-48" />
					<div className="flex items-center gap-4">
						<Skeleton aria-hidden className="h-4 w-8 bg-black/10" />
						<Skeleton aria-hidden className="h-8 w-24" />
						<Button aria-hidden disabled size="sm">
							削除
						</Button>
					</div>
				</div>
			}
		>
			<Action projectIdPromise={projectIdPromise} />
		</Suspense>
	);
}

async function Action({
	projectIdPromise,
}: {
	projectIdPromise: Promise<string>;
}) {
	const projectId = await projectIdPromise;
	const project = await getProjectDetail(projectId);

	return (
		<div className="flex items-center justify-between">
			<h1 className="text-2xl font-bold">{project?.name}</h1>
			<div className="flex items-center gap-4">
				<Link className="underline" href={`/projects/${projectId}/edit`}>
					編集
				</Link>
				<ArchiveProjectButton
					isArchived={!!project?.archivedAt}
					projectId={projectId}
				/>
				<DeleteProjectDialog projectId={projectId} />
			</div>
		</div>
	);
}
