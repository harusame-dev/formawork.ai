import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customerMemoriesTable } from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";

export async function toggleCustomerMemoryLock(
	memoryId: string,
): Promise<Result<{ isProtected: boolean }, "メモリが存在しません">> {
	const memories = await db
		.select({ isProtected: customerMemoriesTable.isProtected })
		.from(customerMemoriesTable)
		.where(eq(customerMemoriesTable.id, memoryId))
		.limit(1);

	if (!memories[0]) {
		return fail("メモリが存在しません");
	}

	const newIsProtected = !memories[0].isProtected;

	await db
		.update(customerMemoriesTable)
		.set({ isProtected: newIsProtected })
		.where(eq(customerMemoriesTable.id, memoryId));

	return succeed({ isProtected: newIsProtected });
}
