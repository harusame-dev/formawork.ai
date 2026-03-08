import { db } from "@workspace/db/client";
import {
	customerNoteAdviceTable,
	type SelectCustomerNoteAdvice,
} from "@workspace/db/schema/customer-note-advice";
import { desc, eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";

export async function getLatestAdvice(customerNoteId: string) {
	"use cache";
	cacheTag(CustomerTag.LatestAdviceByCustomerNoteId(customerNoteId));

	const [advice] = await db
		.select()
		.from(customerNoteAdviceTable)
		.where(eq(customerNoteAdviceTable.customerNoteId, customerNoteId))
		.orderBy(desc(customerNoteAdviceTable.createdAt))
		.limit(1);

	return advice ?? null;
}

/**
 * 複数のノートIDに対する最新アドバイスを一括取得する
 * N+1 回避用。呼び出し元のキャッシュに委ねるため、このレイヤーでは "use cache" しない。
 */
export async function getLatestAdvices(
	customerNoteIds: string[],
): Promise<Map<string, SelectCustomerNoteAdvice>> {
	if (customerNoteIds.length === 0) return new Map();

	// DISTINCT ON で各ノートの最新アドバイスを1クエリで取得
	const advices = await db
		.selectDistinctOn([customerNoteAdviceTable.customerNoteId])
		.from(customerNoteAdviceTable)
		.where(inArray(customerNoteAdviceTable.customerNoteId, customerNoteIds))
		.orderBy(
			customerNoteAdviceTable.customerNoteId,
			desc(customerNoteAdviceTable.createdAt),
		);

	return new Map(advices.map((advice) => [advice.customerNoteId, advice]));
}
