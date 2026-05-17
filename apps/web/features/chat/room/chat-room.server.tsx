import { notFound } from "next/navigation";
import { isChatPublicAccessExpired } from "@/features/chat/access-control";
import { getChat, touchChatLastAccessedAt } from "@/features/chat/get-chat";
import { getChatMessages } from "@/features/chat/messages/get-messages";
import { ChatRoom } from "@/features/chat/room/chat-room.client";
import { getOrganizationsByCategory } from "@/features/chat/room/get-chat-context";
import { getChatTodos } from "@/features/chat/todos/get-todos";
import { getConsultedOrgIdsByChat } from "@/features/consultation/list/get-consultations-by-chat";
import { getOrganizationCategories } from "@/features/organization-category/get-organization-categories";

export async function ChatRoomContainer({ chatId }: { chatId: string }) {
	const chat = await getChat(chatId);
	if (!chat) {
		notFound();
	}

	if (isChatPublicAccessExpired(chat.lastAccessedAt)) {
		return (
			<div className="relative mx-auto mt-8 flex max-w-2xl flex-col gap-5 bg-[#FFFDF8]/80 px-8 py-10 backdrop-blur-sm">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 border border-[#D7C49E]/40"
				/>
				<div className="flex items-center gap-3">
					<span className="h-px w-8 bg-[#B89968]/70" />
					<span className="font-[family-name:var(--font-mincho)] text-[0.65rem] tracking-[0.35em] text-[#8A867F]">
						お 知 ら せ
					</span>
				</div>
				<h2 className="font-[family-name:var(--font-mincho)] text-xl leading-relaxed text-[#2A2622]">
					このお部屋は、いったん閉じさせていただきました。
				</h2>
				<p className="font-[family-name:var(--font-sans-jp)] text-sm leading-[2] text-[#5C5852]">
					最後のご訪問より 1
					週間以上が経過しましたため、公開でのアクセスを停止しております。
					これまでのお話の内容は、運営者およびご紹介元から引き続き拝見できます。
				</p>
			</div>
		);
	}

	await touchChatLastAccessedAt(chatId);

	const [
		messages,
		todos,
		categories,
		organizationsByCategory,
		consultedOrgIds,
	] = await Promise.all([
		getChatMessages(chatId),
		getChatTodos(chatId),
		getOrganizationCategories(),
		getOrganizationsByCategory(),
		getConsultedOrgIdsByChat(chatId),
	]);

	const initialMessages = messages
		.filter((m) => m.role === "user" || m.role === "assistant")
		.map((m) => ({
			content: m.content,
			id: String(m.messageId),
			role: m.role as "user" | "assistant",
		}));

	return (
		<ChatRoom
			categories={categories}
			chatId={chatId}
			contactEmail={chat.contactEmail}
			initialConsultedOrgIds={consultedOrgIds}
			initialMessages={initialMessages}
			initialTodos={todos}
			organizationsByCategory={organizationsByCategory}
		/>
	);
}
