import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customerMemoriesTable } from "@workspace/db/schema/customer-memory";
import { count, eq } from "drizzle-orm";
import { generateUniqueId } from "@/libs/generate-unique-id";
import { MAX_MEMORIES } from "../customer-memory";

type RegisterCustomerMemoryInput = {
	category: number;
	content: string;
	customerId: string;
	importance: number;
};

type ErrorMessage =
	| "メモリの登録に失敗しました"
	| "メモリの登録上限（100件）に達しています";

export async function registerCustomerMemory(
	input: RegisterCustomerMemoryInput,
): Promise<Result<void, ErrorMessage>> {
	const existingCount = await db
		.select({ count: count() })
		.from(customerMemoriesTable)
		.where(eq(customerMemoriesTable.customerId, input.customerId));

	if (existingCount[0] && existingCount[0].count >= MAX_MEMORIES) {
		return fail("メモリの登録上限（100件）に達しています");
	}

	await db.insert(customerMemoriesTable).values({
		category: input.category,
		content: input.content,
		customerId: input.customerId,
		id: generateUniqueId(),
		importance: input.importance,
		isProtected: false,
		sourceNoteId: null,
	});

	return succeed();
}
