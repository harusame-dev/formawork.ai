"use cache";

import { db } from "@workspace/db/client";
import {
  customerMemoriesTable,
  type SelectCustomerMemory,
} from "@workspace/db/schema/customer-memory";
import { asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";
import { MAX_MEMORIES } from "@/features/customer-memory/customer-memory";

export async function getCustomerMemories(
  customerId: string,
): Promise<SelectCustomerMemory[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(CustomerTag.MemoriesByCustomerId(customerId));

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
