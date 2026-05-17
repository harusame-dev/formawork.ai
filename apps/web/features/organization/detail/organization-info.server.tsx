import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { getOrganizationDetail } from "./get-organization-detail";
import { OrganizationInfoPresenter } from "./organization-info.universal";

export async function OrganizationInfoContainer({
	organizationId,
}: {
	organizationId: string;
}) {
	await requireRole([UserRole.Admin, UserRole.OrgUser]);
	const organization = await getOrganizationDetail(organizationId);

	if (!organization) {
		notFound();
	}

	const headerList = await headers();
	const host = headerList.get("host") ?? "localhost:3000";
	const protocol = host.startsWith("localhost") ? "http" : "https";
	const chatLpUrl = `${protocol}://${host}/chats?org=${organization.organizationId}`;

	return (
		<OrganizationInfoPresenter
			chatLpUrl={chatLpUrl}
			organization={organization}
		/>
	);
}
