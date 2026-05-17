import { db } from "@workspace/db/client";
import { chatsTable } from "@workspace/db/schema/chat";
import { organizationsTable } from "@workspace/db/schema/organization";
import { eq } from "drizzle-orm";

type ChatDetail = {
	chatId: string;
	contactEmail: string | null;
	createdAt: Date;
	lastAccessedAt: Date;
	referrerOrgId: string | null;
	referrerOrgName: string | null;
};

export async function getChat(chatId: string): Promise<ChatDetail | null> {
	const result = await db
		.select({
			chatId: chatsTable.chatId,
			contactEmail: chatsTable.contactEmail,
			createdAt: chatsTable.createdAt,
			lastAccessedAt: chatsTable.lastAccessedAt,
			referrerOrgId: chatsTable.referrerOrgId,
			referrerOrgName: organizationsTable.name,
		})
		.from(chatsTable)
		.leftJoin(
			organizationsTable,
			eq(chatsTable.referrerOrgId, organizationsTable.organizationId),
		)
		.where(eq(chatsTable.chatId, chatId))
		.limit(1);

	return result[0] ?? null;
}

export async function touchChatLastAccessedAt(chatId: string): Promise<void> {
	await db
		.update(chatsTable)
		.set({ lastAccessedAt: new Date() })
		.where(eq(chatsTable.chatId, chatId));
}
