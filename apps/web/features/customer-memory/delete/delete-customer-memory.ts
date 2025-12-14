import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customerMemoriesTable } from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";

type DeleteCustomerMemoryInput = {
	memoryId: string;
};

type ErrorMessage = "メモリが存在しません" | "メモリの削除に失敗しました";

export async function deleteCustomerMemory(
	input: DeleteCustomerMemoryInput,
): Promise<Result<void, ErrorMessage>> {
	const memories = await db
		.select({ id: customerMemoriesTable.id })
		.from(customerMemoriesTable)
		.where(eq(customerMemoriesTable.id, input.memoryId))
		.limit(1);

	if (!memories[0]) {
		return fail("メモリが存在しません");
	}

	const deleted = await db
		.delete(customerMemoriesTable)
		.where(eq(customerMemoriesTable.id, input.memoryId))
		.returning({ id: customerMemoriesTable.id });

	if (!deleted[0]) {
		return fail("メモリの削除に失敗しました");
	}

	return succeed();
}
