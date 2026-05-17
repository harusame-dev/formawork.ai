import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { getOrganizationCategories } from "@/features/organization-category/get-organization-categories";
import { OrganizationForm } from "./organization-form.client";

export async function OrganizationRegisterFormContainer({
	lockedCategoryIdPromise,
}: {
	lockedCategoryIdPromise: Promise<string | undefined>;
}) {
	await requireRole([UserRole.Admin]);
	const [categories, lockedCategoryId] = await Promise.all([
		getOrganizationCategories(),
		lockedCategoryIdPromise,
	]);
	return (
		<OrganizationForm
			categories={categories}
			lockedCategoryId={lockedCategoryId}
		/>
	);
}
