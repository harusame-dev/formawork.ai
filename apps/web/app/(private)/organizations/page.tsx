import { Suspense } from "react";
import { OrganizationsContainer } from "@/features/organization/list/organizations.server";
import { OrganizationsSkeleton } from "@/features/organization/list/organizations-skeleton.universal";

export default function Page() {
	return (
		<div className="container mx-auto p-4 flex flex-col gap-4">
			<h1 className="text-xl font-semibold">組織一覧</h1>
			<Suspense fallback={<OrganizationsSkeleton />}>
				<OrganizationsContainer />
			</Suspense>
		</div>
	);
}
