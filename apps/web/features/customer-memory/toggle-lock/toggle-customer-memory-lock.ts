import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customerMemoriesTable } from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";

export async function toggleCustomerMemoryLock(
	memoryId: string,
): Promise<Result<{ isLocked: boolean }, "メモリが存在しません">> {
	const memories = await db
		.select({ isLocked: customerMemoriesTable.isLocked })
		.from(customerMemoriesTable)
		.where(eq(customerMemoriesTable.id, memoryId))
		.limit(1);

	if (!memories[0]) {
		return fail("メモリが存在しません");
	}

	const newIsLocked = !memories[0].isLocked;

	await db
		.update(customerMemoriesTable)
		.set({ isLocked: newIsLocked })
		.where(eq(customerMemoriesTable.id, memoryId));

	return succeed({ isLocked: newIsLocked });
}
