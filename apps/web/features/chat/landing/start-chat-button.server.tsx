import { StartChatButton } from "@/app/(public)/chats/_components/start-chat-button.client";
import type { OrganizationDetail } from "@/features/organization/detail/get-organization-detail";

export async function StartChatButtonContainer({
	organizationPromise,
}: {
	organizationPromise: Promise<OrganizationDetail | null>;
}) {
	const organization = await organizationPromise;
	return (
		<StartChatButton organizationId={organization?.organizationId ?? null} />
	);
}
