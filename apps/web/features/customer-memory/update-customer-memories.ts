import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { schemaName } from "@workspace/db/pgschema";
import {
	customerMemoriesTable,
	type MemoryCategory,
} from "@workspace/db/schema/customer-memory";
import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import * as v from "valibot";
import { genderSchema } from "@/features/customer/schema";
import { CustomerTag } from "@/features/customer/tag";
import {
	type GenerateMemoryOperationsParams,
	generateMemoryOperations,
	type MemoryOperation,
} from "./generate-memory";

const CONTEXT_NOTES_LIMIT = 10;
const MAX_MEMORIES_PER_CUSTOMER = 100;

type CustomerData = {
	customerId: string;
	firstName: string;
	lastName: string;
	birthDate: string | null;
	gender: number;
	remarks: string;
};

type NoteData = {
	id: string;
	content: string;
	serviceDate: string;
};

type ContextNote = {
	content: string;
	createdAt: Date;
};

type ExistingMemory = {
	id: string;
	category: MemoryCategory;
	content: string;
	importance: number;
};

export class CustomerNotFoundError extends Error {
	constructor(customerId: string) {
		super(`Customer not found: ${customerId}`);
		this.name = "CustomerNotFoundError";
	}
}

export class NotesNotFoundError extends Error {
	constructor(noteIds: string[]) {
		super(`Notes not found: ${noteIds.join(", ")}`);
		this.name = "NotesNotFoundError";
	}
}

async function fetchCustomerData(
	customerId: string,
): Promise<CustomerData | null> {
	const results = await db.execute<CustomerData>(sql`
		SELECT
			customer_id as "customerId",
			first_name as "firstName",
			last_name as "lastName",
			birth_date as "birthDate",
			gender,
			remarks
		FROM ${sql.identifier(schemaName)}.customers
		WHERE customer_id = ${customerId}::uuid
	`);
	return results[0] ?? null;
}

async function fetchNotesData(noteIds: string[]): Promise<NoteData[]> {
	if (noteIds.length === 0) return [];

	return db.execute<NoteData>(sql`
		SELECT
			id,
			content,
			service_date as "serviceDate"
		FROM ${sql.identifier(schemaName)}.customer_notes
		WHERE id IN (${sql.join(
			noteIds.map((id) => sql`${id}::uuid`),
			sql`, `,
		)})
	`);
}

async function fetchContextNotes(
	customerId: string,
	excludeNoteIds: string[],
): Promise<ContextNote[]> {
	const excludeCondition =
		excludeNoteIds.length > 0
			? sql`AND id NOT IN (${sql.join(
					excludeNoteIds.map((id) => sql`${id}::uuid`),
					sql`, `,
				)})`
			: sql``;

	const results = await db.execute<{ content: string; createdAt: Date }>(sql`
		SELECT content, created_at as "createdAt"
		FROM ${sql.identifier(schemaName)}.customer_notes
		WHERE customer_id = ${customerId}::uuid
		${excludeCondition}
		ORDER BY created_at DESC
		LIMIT ${CONTEXT_NOTES_LIMIT}
	`);

	return results.map((r) => ({
		content: r.content,
		createdAt: new Date(r.createdAt),
	}));
}

async function fetchExistingMemories(
	customerId: string,
): Promise<ExistingMemory[]> {
	const results = await db.execute<ExistingMemory>(sql`
		SELECT
			id,
			category,
			content,
			importance
		FROM ${sql.identifier(schemaName)}.customer_memories
		WHERE customer_id = ${customerId}::uuid
		ORDER BY importance DESC, created_at DESC
	`);

	return results.map((r) => ({
		category: r.category as MemoryCategory,
		content: r.content,
		id: r.id,
		importance: r.importance,
	}));
}

async function executeOperations(
	customerId: string,
	operations: MemoryOperation[],
	sourceNoteId: string | null,
): Promise<void> {
	const logger = await getLogger("executeMemoryOperations");

	for (const op of operations) {
		switch (op.operation) {
			case "create":
				await db.insert(customerMemoriesTable).values({
					category: op.category as MemoryCategory,
					content: op.content,
					customerId,
					importance: op.importance,
					sourceNoteId,
				});
				logger.info("メモリー作成", {
					category: op.category,
					content: op.content,
					customerId,
					reason: op.reason,
				});
				break;

			case "update":
				{
					const updateData: Record<string, unknown> = {};
					if (op.newContent !== undefined) {
						// biome-ignore lint/complexity/useLiteralKeys: ts4111
						updateData["content"] = op.newContent;
					}
					if (op.newImportance !== undefined) {
						// biome-ignore lint/complexity/useLiteralKeys: ts4111
						updateData["importance"] = op.newImportance;
					}
					if (Object.keys(updateData).length > 0) {
						await db
							.update(customerMemoriesTable)
							.set(updateData)
							.where(eq(customerMemoriesTable.id, op.memoryId));
						logger.info("メモリー更新", {
							memoryId: op.memoryId,
							reason: op.reason,
							updates: updateData,
						});
					}
				}
				break;

			case "delete":
				await db
					.delete(customerMemoriesTable)
					.where(eq(customerMemoriesTable.id, op.memoryId));
				logger.info("メモリー削除", {
					memoryId: op.memoryId,
					reason: op.reason,
				});
				break;
		}
	}
}

async function enforceMemoryLimit(customerId: string): Promise<void> {
	const logger = await getLogger("enforceMemoryLimit");

	const countResult = await db.execute<{ count: string }>(sql`
		SELECT COUNT(*) as count
		FROM ${sql.identifier(schemaName)}.customer_memories
		WHERE customer_id = ${customerId}::uuid
	`);

	const currentCount = Number(countResult[0]?.count ?? 0);

	if (currentCount > MAX_MEMORIES_PER_CUSTOMER) {
		const deleteCount = currentCount - MAX_MEMORIES_PER_CUSTOMER;

		await db.execute(sql`
			DELETE FROM ${sql.identifier(schemaName)}.customer_memories
			WHERE id IN (
				SELECT id
				FROM ${sql.identifier(schemaName)}.customer_memories
				WHERE customer_id = ${customerId}::uuid
				ORDER BY importance ASC, created_at ASC
				LIMIT ${deleteCount}
			)
		`);

		logger.info("メモリー件数制限適用", {
			customerId,
			deletedCount: deleteCount,
			previousCount: currentCount,
		});
	}
}

type UpdateCustomerMemoriesResult = {
	operationsCount: number;
};

export async function updateCustomerMemories(
	customerId: string,
	noteIds: string[],
): Promise<UpdateCustomerMemoriesResult> {
	const logger = await getLogger("updateCustomerMemories");

	logger.info("メモリー更新開始", { customerId, noteIds });

	const customerData = await fetchCustomerData(customerId);
	if (!customerData) {
		throw new CustomerNotFoundError(customerId);
	}

	const targetNotes = await fetchNotesData(noteIds);
	if (targetNotes.length === 0) {
		throw new NotesNotFoundError(noteIds);
	}

	const contextNotes = await fetchContextNotes(customerId, noteIds);
	const existingMemories = await fetchExistingMemories(customerId);

	const params: GenerateMemoryOperationsParams = {
		contextNotes,
		customer: {
			birthDate: customerData.birthDate,
			firstName: customerData.firstName,
			gender: v.parse(genderSchema, customerData.gender),
			lastName: customerData.lastName,
			remarks: customerData.remarks,
		},
		existingMemories,
		targetNotes: targetNotes.map((note) => ({
			content: note.content,
			id: note.id,
			serviceDate: note.serviceDate,
		})),
	};

	const result = await generateMemoryOperations(params);

	if (result.operations.length > 0) {
		const primaryNoteId = targetNotes[0]?.id ?? null;
		await executeOperations(customerId, result.operations, primaryNoteId);
		await enforceMemoryLimit(customerId);
		revalidateTag(CustomerTag.MemoryCrud(customerId), { expire: 0 });
	}

	logger.info("メモリー更新完了", {
		customerId,
		operationsCount: result.operations.length,
	});

	return { operationsCount: result.operations.length };
}
