import type { OrganizationDetail } from "@/features/organization/detail/get-organization-detail";
import { ReferralPresenter } from "./referral.universal";

export async function ReferralContainer({
	organizationPromise,
}: {
	organizationPromise: Promise<OrganizationDetail | null>;
}) {
	const organization = await organizationPromise;
	return <ReferralPresenter organization={organization} />;
}
