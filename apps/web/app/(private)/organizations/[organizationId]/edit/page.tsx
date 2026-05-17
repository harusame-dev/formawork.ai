import { Suspense } from "react";
import { OrganizationEditFormContainer } from "@/features/organization/edit/organization-edit-form.server";
import { OrganizationFormSkeleton } from "@/features/organization/register/organization-form-skeleton.universal";

export default function Page({
	params,
}: PageProps<"/organizations/[organizationId]/edit">) {
	const organizationIdPromise = params.then((p) => p.organizationId);

	return (
		<div className="container mx-auto p-4 flex flex-col gap-4 max-w-3xl">
			<h1 className="text-xl font-semibold">組織を編集</h1>
			<Suspense fallback={<OrganizationFormSkeleton />}>
				<OrganizationEditWithAuth
					organizationIdPromise={organizationIdPromise}
				/>
			</Suspense>
		</div>
	);
}

async function OrganizationEditWithAuth({
	organizationIdPromise,
}: {
	organizationIdPromise: Promise<string>;
}) {
	const organizationId = await organizationIdPromise;
	return <OrganizationEditFormContainer organizationId={organizationId} />;
}
