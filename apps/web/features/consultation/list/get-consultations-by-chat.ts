import { db } from "@workspace/db/client";
import { consultationsTable } from "@workspace/db/schema/consultation";
import { and, eq, isNotNull } from "drizzle-orm";

// 指定チャットで相談済みの組織 ID 一覧を返す
// 削除済み組織（target_org_id が NULL）はスキップ
export async function getConsultedOrgIdsByChat(
	chatId: string,
): Promise<string[]> {
	const rows = await db
		.selectDistinct({ targetOrgId: consultationsTable.targetOrgId })
		.from(consultationsTable)
		.where(
			and(
				eq(consultationsTable.chatId, chatId),
				isNotNull(consultationsTable.targetOrgId),
			),
		);

	return rows
		.map((row) => row.targetOrgId)
		.filter((id): id is string => id !== null);
}
