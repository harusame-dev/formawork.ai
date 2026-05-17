import { db } from "@workspace/db/client";
import { chatsTable } from "@workspace/db/schema/chat";
import { consultationsTable } from "@workspace/db/schema/consultation";
import { organizationsTable } from "@workspace/db/schema/organization";
import { desc, eq, sql } from "drizzle-orm";

export type ChatSummary = {
	chatId: string;
	contactEmail: string | null;
	createdAt: Date;
	lastAccessedAt: Date;
	referrerOrgId: string | null;
	referrerOrgName: string | null;
};

// admin 用: 全チャット一覧
export async function getAllChats(page: number): Promise<{
	chats: ChatSummary[];
	page: number;
	totalPages: number;
}> {
	const pageSize = 30;
	const chats = await db
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
		.orderBy(desc(chatsTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(chatsTable)
		.then((result) => Number(result[0]?.count ?? 0));

	return {
		chats,
		page,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

// 組織詳細 - 関連チャット履歴タブ
// 自組織が「相談された」チャット（consultations.target_org_id = 当該組織）のみ
export async function getChatsByConsultedOrganization(
	organizationId: string,
): Promise<ChatSummary[]> {
	return db
		.selectDistinctOn([chatsTable.chatId], {
			chatId: chatsTable.chatId,
			contactEmail: chatsTable.contactEmail,
			createdAt: chatsTable.createdAt,
			lastAccessedAt: chatsTable.lastAccessedAt,
			referrerOrgId: chatsTable.referrerOrgId,
			referrerOrgName: organizationsTable.name,
		})
		.from(chatsTable)
		.innerJoin(
			consultationsTable,
			eq(consultationsTable.chatId, chatsTable.chatId),
		)
		.leftJoin(
			organizationsTable,
			eq(chatsTable.referrerOrgId, organizationsTable.organizationId),
		)
		.where(eq(consultationsTable.targetOrgId, organizationId));
}
