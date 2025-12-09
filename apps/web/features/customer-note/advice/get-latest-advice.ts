import { db } from "@workspace/db/client";
import { customerNoteAdviceTable } from "@workspace/db/schema/customer-note-advice";
import { desc, eq } from "drizzle-orm";

export async function getLatestAdvice(customerNoteId: string) {
	const [advice] = await db
		.select()
		.from(customerNoteAdviceTable)
		.where(eq(customerNoteAdviceTable.customerNoteId, customerNoteId))
		.orderBy(desc(customerNoteAdviceTable.createdAt))
		.limit(1);

	return advice ?? null;
}
