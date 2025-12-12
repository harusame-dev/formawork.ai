import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { MEMORY_QUEUE_NAME } from "@workspace/db/queue-names";
import { sql } from "drizzle-orm";
import {
	CustomerNotFoundError,
	NotesNotFoundError,
	updateCustomerMemories,
} from "./update-customer-memories";

const MAX_RETRY_COUNT = 3;

type QueueMessage = {
	msg_id: number;
	read_ct: number;
	message: {
		customerId: string;
		serviceNoteId: string;
	};
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

	const noteIds = messages.map((m) => m.message.serviceNoteId);

	try {
		const result = await updateCustomerMemories(customerId, noteIds);

		for (const msg of messages) {
			await deleteMessage(msg.msg_id);
		}

		logger.info("顧客のメモリー処理完了", {
			customerId,
			operationsCount: result.operationsCount,
		});
	} catch (error) {
		if (
			error instanceof CustomerNotFoundError ||
			error instanceof NotesNotFoundError
		) {
			logger.warn("データなしのためアーカイブ", {
				customerId,
				error: error.message,
			});
			for (const msg of messages) {
				await archiveMessage(msg.msg_id);
			}
			return;
		}
		throw error;
	}
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

	const serializedResults = results.map((result, index) => {
		if (result.status === "fulfilled") {
			return { status: "fulfilled" };
		}
		const error = result.reason;
		return {
			customerId: customerIds[index],
			error: {
				cause: error.cause,
				message: error.message,
				name: error.name,
				stack: error.stack,
			},
			status: "rejected",
		};
	});

	const failedCount = serializedResults.filter(
		(r) => r.status === "rejected",
	).length;

	if (failedCount > 0) {
		logger.error("処理完了（エラーあり）", {
			failedCount,
			results: serializedResults,
			successCount: results.length - failedCount,
		});
	} else {
		logger.info("処理完了", { successCount: results.length });
	}
}
