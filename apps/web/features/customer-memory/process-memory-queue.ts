import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { schemaName } from "@workspace/db/pgschema";
import { MEMORY_QUEUE_NAME } from "@workspace/db/queue-names";
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
	type GenerateMemoryParams,
	generateMemory,
	type MemoryOperation,
} from "./generate-memory";

const RECENT_NOTES_LIMIT = 10;
const MAX_RETRY_COUNT = 3;
const MAX_MEMORIES_PER_CUSTOMER = 100;

type QueueMessage = {
	msg_id: number;
	read_ct: number;
	message: {
		customerId: string;
		serviceNoteId: string;
	};
};

type CustomerData = {
	customerId: string;
	firstName: string;
	lastName: string;
	birthDate: string | null;
	gender: number;
	remarks: string | null;
};

type NoteData = {
	id: string;
	content: string;
	serviceDate: string;
};

type RecentNote = {
	content: string;
	createdAt: Date;
};

type ExistingMemory = {
	id: string;
	category: MemoryCategory;
	content: string;
	importance: number;
};

async function readMessagesFromQueue(): Promise<QueueMessage[]> {
	return db.execute<QueueMessage>(sql`
		SELECT * FROM pgmq.read(${MEMORY_QUEUE_NAME}, 30, 10)
	`);
}

async function archiveMessage(msgId: number): Promise<void> {
	await db.execute(
		sql.raw(`SELECT * FROM pgmq.archive('${MEMORY_QUEUE_NAME}', ${msgId})`),
	);
}

async function deleteMessage(msgId: number): Promise<void> {
	await db.execute(
		sql.raw(`SELECT * FROM pgmq.delete('${MEMORY_QUEUE_NAME}', ${msgId})`),
	);
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

async function fetchRecentNotes(
	customerId: string,
	excludeNoteIds: string[],
): Promise<RecentNote[]> {
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
		LIMIT ${RECENT_NOTES_LIMIT}
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
						updateData.content = op.newContent;
					}
					if (op.newImportance !== undefined) {
						updateData.importance = op.newImportance;
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

async function processCustomerMessages(
	customerId: string,
	messages: QueueMessage[],
): Promise<void> {
	const logger = await getLogger("processMemoryQueue");

	logger.info("顧客のメモリー処理開始", {
		customerId,
		messageCount: messages.length,
	});

	const maxReadCount = Math.max(...messages.map((m) => m.read_ct));
	if (maxReadCount > MAX_RETRY_COUNT) {
		logger.error("最大リトライ回数超過のためアーカイブ", {
			customerId,
			maxReadCount,
		});
		for (const msg of messages) {
			await archiveMessage(msg.msg_id);
		}
		return;
	}

	const customerData = await fetchCustomerData(customerId);
	if (!customerData) {
		logger.warn("顧客なしのためアーカイブ", { customerId });
		for (const msg of messages) {
			await archiveMessage(msg.msg_id);
		}
		return;
	}

	const noteIds = messages.map((m) => m.message.serviceNoteId);
	const targetNotes = await fetchNotesData(noteIds);

	if (targetNotes.length === 0) {
		logger.warn("対象ノートなしのためアーカイブ", { customerId, noteIds });
		for (const msg of messages) {
			await archiveMessage(msg.msg_id);
		}
		return;
	}

	const recentNotes = await fetchRecentNotes(customerId, noteIds);
	const existingMemories = await fetchExistingMemories(customerId);

	const params: GenerateMemoryParams = {
		customer: {
			birthDate: customerData.birthDate,
			firstName: customerData.firstName,
			gender: v.parse(genderSchema, customerData.gender),
			lastName: customerData.lastName,
			remarks: customerData.remarks,
		},
		existingMemories,
		recentNotes,
		targetNotes: targetNotes.map((note) => ({
			content: note.content,
			id: note.id,
			serviceDate: note.serviceDate,
		})),
	};

	const result = await generateMemory(params);

	if (result.operations.length > 0) {
		const primaryNoteId = targetNotes[0]?.id ?? null;
		await executeOperations(customerId, result.operations, primaryNoteId);
		await enforceMemoryLimit(customerId);
		revalidateTag(CustomerTag.MemoryCrud(customerId), { expire: 0 });
	}

	for (const msg of messages) {
		await deleteMessage(msg.msg_id);
	}

	logger.info("顧客のメモリー処理完了", {
		customerId,
		operationsCount: result.operations.length,
	});
}

export async function processMemoryQueue(): Promise<void> {
	const logger = await getLogger("processMemoryQueue");

	const messages = await readMessagesFromQueue();
	logger.info("メッセージ読み取り", { messageCount: messages.length });

	if (messages.length === 0) {
		logger.info("メッセージ0件のため終了");
		return;
	}

	const groupedByCustomer = Object.groupBy(
		messages,
		(msg) => msg.message.customerId,
	);

	const customerIds = Object.keys(groupedByCustomer);

	logger.info("顧客別にグループ化", {
		customerCount: customerIds.length,
		totalMessages: messages.length,
	});

	const results = await Promise.allSettled(
		customerIds.map((customerId) =>
			processCustomerMessages(customerId, groupedByCustomer[customerId] ?? []),
		),
	);

	const failures = results
		.map((r, i) =>
			r.status === "rejected" ? { index: i, reason: r.reason } : null,
		)
		.filter((f): f is { index: number; reason: unknown } => f !== null);

	if (failures.length > 0) {
		for (const failure of failures) {
			const customerId = customerIds[failure.index];
			logger.error("顧客のメモリー処理失敗", {
				customerId,
				err: failure.reason,
			});
		}
		logger.warn("一部の処理に失敗", {
			failed: failures.length,
			total: customerIds.length,
		});
	}
}
