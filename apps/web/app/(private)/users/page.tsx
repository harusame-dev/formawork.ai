import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { RegisterUserLink } from "@/features/user/list/register-user-link.server";
import { parseUsersConditionSearchParams } from "@/features/user/list/schema";
import { UserSearchFormContainer } from "@/features/user/list/user-search-form.server";
import { UserSearchFormSkeleton } from "@/features/user/list/user-search-form-skeleton.universal";
import { UsersContainer } from "@/features/user/list/users.server";
import { UsersSkeleton } from "@/features/user/list/users-skeleton.universal";
import { SuspenseOnSearch } from "@/libs/suspense-on-search.client";

export default async function Page({ searchParams }: PageProps<"/users">) {
	const validatedCondition = searchParams.then(
		(params) => parseUsersConditionSearchParams(params).data,
	);

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between px-6 py-4">
				<h1 className="text-xl font-bold">ユーザー一覧</h1>
				<Suspense fallback={<Skeleton className="h-4 w-14" />}>
					<RegisterUserLink />
				</Suspense>
			</div>
			<div className="px-6 pb-6 space-y-4">
				<div className="rounded-lg border bg-card p-4">
					<SuspenseOnSearch fallback={<UserSearchFormSkeleton />}>
						<UserSearchFormContainer conditionPromise={validatedCondition} />
					</SuspenseOnSearch>
				</div>
				<div className="rounded-lg border bg-card">
					<SuspenseOnSearch fallback={<UsersSkeleton />}>
						<UsersContainer condition={validatedCondition} />
					</SuspenseOnSearch>
				</div>
			</div>
		</div>
	);
}
