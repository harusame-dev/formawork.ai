import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { AllTasksContainer } from "@/features/task/list/all-tasks.server";
import { RegisterTaskLink } from "@/features/task/list/register-task-link.server";
import { parseTasksConditionSearchParams } from "@/features/task/list/schema";
import { TaskSearchFormContainer } from "@/features/task/list/task-search-form.server";
import { TaskSearchFormSkeleton } from "@/features/task/list/task-search-form-skeleton.universal";
import { SuspenseOnSearch } from "@/libs/suspense-on-search.client";

export default async function Page({ searchParams }: PageProps<"/tasks">) {
	const validatedCondition = searchParams.then(
		(params) => parseTasksConditionSearchParams(params).data,
	);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold">タスク一覧</h1>
				<Suspense fallback={<Skeleton className="h-5 w-16" />}>
					<RegisterTaskLink />
				</Suspense>
			</div>
			<Card className="p-4 w-full">
				<SuspenseOnSearch fallback={<TaskSearchFormSkeleton />}>
					<TaskSearchFormContainer conditionPromise={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
			<Card className="py-2 w-full">
				<SuspenseOnSearch fallback={<div className="sr-only">読み込み中</div>}>
					<AllTasksContainer conditionPromise={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
		</div>
	);
}
