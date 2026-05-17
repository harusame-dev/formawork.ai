import { notFound } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { OrganizationForm } from "@/features/organization/register/organization-form.client";
import { getOrganizationCategories } from "@/features/organization-category/get-organization-categories";
import { getOrganizationDetail } from "../detail/get-organization-detail";

export async function OrganizationEditFormContainer({
	organizationId,
}: {
	organizationId: string;
}) {
	await requireRole([UserRole.Admin]);
	const [organization, categories] = await Promise.all([
		getOrganizationDetail(organizationId),
		getOrganizationCategories(),
	]);

	if (!organization) {
		notFound();
	}

	return (
		<OrganizationForm
			categories={categories}
			initialValues={{
				categoryId: organization.categoryId,
				description: organization.description,
				email: organization.email,
				name: organization.name,
				url: organization.url,
			}}
			organizationId={organization.organizationId}
		/>
	);
}
