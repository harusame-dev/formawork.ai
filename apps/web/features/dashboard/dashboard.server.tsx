import { redirect } from "next/navigation";
import { getUserOrganizationId } from "@/features/auth/get-user-organization-id";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { DashboardPresenter } from "./dashboard.universal";

export async function DashboardContainer() {
	const role = await getUserRole();

	if (role === UserRole.OrgUser) {
		const organizationId = await getUserOrganizationId();
		if (organizationId) {
			redirect(`/organizations/${organizationId}`);
		}
	}

	return <DashboardPresenter />;
}
