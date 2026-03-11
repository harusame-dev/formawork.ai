import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteProjectDialog } from "@/features/project/delete/delete-project-dialog.client";

export default function Page({ params }: PageProps<"/projects/[projectId]">) {
	const projectIdPromise = params.then(({ projectId }) => projectId);

	return (
		<Suspense
			fallback={
				<div aria-busy className="flex items-center gap-4">
					<span className="sr-only">操作読み込み中</span>
					<Skeleton aria-hidden className="h-4 w-8 bg-black/10" />
					<Button aria-hidden disabled size="sm">
						削除
					</Button>
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

	return (
		<div className="flex items-center gap-4">
			<Link className="underline" href={`/projects/${projectId}/edit`}>
				編集
			</Link>
			<DeleteProjectDialog projectId={projectId} />
		</div>
	);
}
