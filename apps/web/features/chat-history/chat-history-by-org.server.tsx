import { ChatListPresenter } from "./chat-list.universal";
import { getChatsByConsultedOrganization } from "./get-chats";

export async function ChatHistoryByOrgContainer({
	organizationId,
}: {
	organizationId: string;
}) {
	const chats = await getChatsByConsultedOrganization(organizationId);

	return (
		<ChatListPresenter
			chats={chats}
			emptyMessage="この組織に対する相談はまだありません"
			linkPrefix={`/organizations/${organizationId}/chats`}
		/>
	);
}
