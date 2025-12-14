import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customerMemoriesTable } from "@workspace/db/schema/customer-memory";
import { eq } from "drizzle-orm";

type EditCustomerMemoryInput = {
	category: number;
	content: string;
	importance: number;
	memoryId: string;
};

type ErrorMessage = "メモリが存在しません" | "メモリの更新に失敗しました";

export async function editCustomerMemory(
	input: EditCustomerMemoryInput,
): Promise<Result<void, ErrorMessage>> {
	const memories = await db
		.select({ id: customerMemoriesTable.id })
		.from(customerMemoriesTable)
		.where(eq(customerMemoriesTable.id, input.memoryId))
		.limit(1);

	if (!memories[0]) {
		return fail("メモリが存在しません");
	}

	await db
		.update(customerMemoriesTable)
		.set({
			category: input.category,
			content: input.content,
			importance: input.importance,
		})
		.where(eq(customerMemoriesTable.id, input.memoryId));

	return succeed();
}
