import { forbidden, notFound } from "next/navigation";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { getChat } from "@/features/chat/get-chat";
import { getChatMessages } from "@/features/chat/messages/get-messages";
import { getChatTodos } from "@/features/chat/todos/get-todos";
import { getOrganizationDetail } from "@/features/organization/detail/get-organization-detail";
import { ChatDetailPresenter } from "./chat-detail.universal";

export async function ChatDetailContainer({
	chatId,
	organizationId,
	requireAdmin,
}: {
	chatId: string;
	organizationId?: string;
	requireAdmin: boolean;
}) {
	const role = await getUserRole();
	if (requireAdmin) {
		if (role !== UserRole.Admin) {
			forbidden();
		}
	} else if (role !== UserRole.Admin && role !== UserRole.OrgUser) {
		forbidden();
	}

	const chat = await getChat(chatId);
	if (!chat) {
		notFound();
	}
	const [messages, todos, organization] = await Promise.all([
		getChatMessages(chatId),
		getChatTodos(chatId),
		organizationId ? getOrganizationDetail(organizationId) : null,
	]);

	return (
		<ChatDetailPresenter
			messages={messages}
			relevantCategoryId={organization?.categoryId ?? null}
			todos={todos}
		/>
	);
}
