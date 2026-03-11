import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { ProjectSearchFormContainer } from "@/features/project/list/project-search-form.server";
import { ProjectSearchFormSkeleton } from "@/features/project/list/project-search-form-skeleton.universal";
import { ProjectsContainer } from "@/features/project/list/projects.server";
import { ProjectsSkeleton } from "@/features/project/list/projects-skeleton.universal";
import { RegisterProjectLink } from "@/features/project/list/register-project-link.server";
import { parseProjectsConditionSearchParams } from "@/features/project/list/schema";
import { SuspenseOnSearch } from "@/libs/suspense-on-search.client";

export default async function Page({ searchParams }: PageProps<"/projects">) {
	const validatedCondition = searchParams.then(
		(params) => parseProjectsConditionSearchParams(params).data,
	);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold">案件一覧</h1>
				<Suspense fallback={<Skeleton className="h-5 w-16" />}>
					<RegisterProjectLink />
				</Suspense>
			</div>
			<Card className="p-4 w-full">
				<SuspenseOnSearch fallback={<ProjectSearchFormSkeleton />}>
					<ProjectSearchFormContainer conditionPromise={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
			<Card className="py-2 w-full">
				<SuspenseOnSearch fallback={<ProjectsSkeleton />}>
					<ProjectsContainer condition={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
		</div>
	);
}
