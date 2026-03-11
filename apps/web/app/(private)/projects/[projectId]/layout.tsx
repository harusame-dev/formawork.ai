import type { ReactNode } from "react";
import { Suspense } from "react";
import { ProjectInfoContainer } from "@/features/project/detail/project-info.server";
import { ProjectInfoSkeleton } from "@/features/project/detail/project-info-skeleton.universal";

type ProjectDetailLayoutProps = LayoutProps<"/projects/[projectId]"> & {
	action: ReactNode;
};

export default async function ProjectDetailLayout({
	params,
	children,
	action,
}: ProjectDetailLayoutProps) {
	const projectIdPromise = params.then(({ projectId }) => projectId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<Suspense fallback={<ProjectInfoSkeleton />}>
					<ProjectInfoContainer projectIdPromise={projectIdPromise} />
				</Suspense>
				{action}
			</div>

			{children}
		</div>
	);
}
