import { db } from "@workspace/db/client";
import {
  customerNoteAdviceTable,
  type SelectCustomerNoteAdvice,
} from "@workspace/db/schema/customer-note-advice";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";

export async function getLatestAdvice(
  customerNoteId: string,
): Promise<SelectCustomerNoteAdvice | null> {
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
