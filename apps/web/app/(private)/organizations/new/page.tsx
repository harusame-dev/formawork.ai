import { Suspense } from "react";
import * as v from "valibot";
import { OrganizationRegisterFormContainer } from "@/features/organization/register/organization-form.server";
import { OrganizationFormSkeleton } from "@/features/organization/register/organization-form-skeleton.universal";
import { newOrganizationSearchParamsSchema } from "@/features/organization/register/schema";

export default function Page({
	searchParams,
}: PageProps<"/organizations/new">) {
	const lockedCategoryIdPromise = searchParams.then(
		({ categoryId }) =>
			v.parse(newOrganizationSearchParamsSchema, { categoryId }).categoryId,
	);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4 max-w-3xl">
			<h1 className="text-xl font-semibold">組織を登録</h1>
			<Suspense fallback={<OrganizationFormSkeleton />}>
				<OrganizationRegisterFormContainer
					lockedCategoryIdPromise={lockedCategoryIdPromise}
				/>
			</Suspense>
		</div>
	);
}
