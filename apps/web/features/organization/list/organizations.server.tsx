import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { getOrganizations } from "./get-organizations";
import { OrganizationsPresenter } from "./organizations.universal";

export async function OrganizationsContainer() {
	await requireRole([UserRole.Admin, UserRole.OrgUser]);
	const items = await getOrganizations();

	return <OrganizationsPresenter items={items} />;
}
