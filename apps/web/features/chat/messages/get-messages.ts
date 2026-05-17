import { db } from "@workspace/db/client";
import { chatMessagesTable } from "@workspace/db/schema/chat-message";
import { asc, eq } from "drizzle-orm";

export type ChatMessage = {
	chatId: string;
	content: string;
	createdAt: Date;
	messageId: number;
	role: string;
};

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
	return db
		.select({
			chatId: chatMessagesTable.chatId,
			content: chatMessagesTable.content,
			createdAt: chatMessagesTable.createdAt,
			messageId: chatMessagesTable.messageId,
			role: chatMessagesTable.role,
		})
		.from(chatMessagesTable)
		.where(eq(chatMessagesTable.chatId, chatId))
		.orderBy(asc(chatMessagesTable.createdAt));
}

export async function appendChatMessage({
	chatId,
	content,
	role,
}: {
	chatId: string;
	content: string;
	role: "user" | "assistant" | "system";
}): Promise<void> {
	await db.insert(chatMessagesTable).values({ chatId, content, role });
}
