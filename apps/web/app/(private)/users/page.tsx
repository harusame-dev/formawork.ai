import { Card } from "@workspace/ui/components/card";
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
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold">ユーザー一覧</h1>
				<Suspense fallback={<Skeleton className="h-5 w-16" />}>
					<RegisterUserLink />
				</Suspense>
			</div>
			<Card className="p-4 w-full">
				<SuspenseOnSearch fallback={<UserSearchFormSkeleton />}>
					<UserSearchFormContainer conditionPromise={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
			<Card className="py-2 w-full">
				<SuspenseOnSearch fallback={<UsersSkeleton />}>
					<UsersContainer condition={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
		</div>
	);
}
