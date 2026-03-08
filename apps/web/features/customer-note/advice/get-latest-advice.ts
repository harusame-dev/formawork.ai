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
 * 複数ノートの最新アドバイスを一括取得する
 * DISTINCT ON + IN 句で1クエリに削減
 * @returns Map<customerNoteId, advice | null>
 */
export async function getLatestAdvices(
	customerNoteIds: string[],
): Promise<Map<string, SelectCustomerNoteAdvice | null>> {
	if (customerNoteIds.length === 0) {
		return new Map();
	}

	const advices = await db
		.selectDistinctOn([customerNoteAdviceTable.customerNoteId])
		.from(customerNoteAdviceTable)
		.where(inArray(customerNoteAdviceTable.customerNoteId, customerNoteIds))
		.orderBy(
			customerNoteAdviceTable.customerNoteId,
			desc(customerNoteAdviceTable.createdAt),
		);

	const adviceMap = new Map<string, SelectCustomerNoteAdvice | null>(
		customerNoteIds.map((id) => [id, null]),
	);
	for (const advice of advices) {
		adviceMap.set(advice.customerNoteId, advice);
	}

	return adviceMap;
}
