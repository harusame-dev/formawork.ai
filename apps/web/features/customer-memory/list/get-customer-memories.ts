"use cache";

import { db } from "@workspace/db/client";
import {
	customerMemoriesTable,
	type SelectCustomerMemory,
} from "@workspace/db/schema/customer-memory";
import { asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";

const MAX_MEMORIES = 100;

export async function getCustomerMemories(
	customerId: string,
): Promise<SelectCustomerMemory[]> {
	cacheTag(CustomerTag.MemoryCrud(customerId));
	cacheLife("permanent");

	const memories = await db
		.select()
		.from(customerMemoriesTable)
		.where(eq(customerMemoriesTable.customerId, customerId))
		.orderBy(
			asc(customerMemoriesTable.category),
			desc(customerMemoriesTable.importance),
		)
		.limit(MAX_MEMORIES);

	return memories;
}
