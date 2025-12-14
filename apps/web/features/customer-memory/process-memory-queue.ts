import { getLogger } from "@repo/logger/nextjs/server";
import { MEMORY_QUEUE_NAME } from "@workspace/db/queue-names";
import { type PgmqMessage, PgmqQueue } from "@/libs/queue";
import {
	CustomerNotFoundError,
	NotesNotFoundError,
	updateCustomerMemories,
} from "./update-customer-memories";

type MemoryQueuePayload = {
	customerId: string;
	serviceNoteId: string;
};

const memoryQueue = new PgmqQueue<MemoryQueuePayload>(MEMORY_QUEUE_NAME);

async function processCustomerMessages(
	customerId: string,
	messages: PgmqMessage<MemoryQueuePayload>[],
): Promise<void> {
	const logger = await getLogger("processMemoryQueue");

	logger.info("顧客のメモリー処理開始", {
		customerId,
		messageCount: messages.length,
	});

	const noteIds = messages.map((m) => m.message.serviceNoteId);

	try {
		const result = await updateCustomerMemories(customerId, noteIds);

		for (const msg of messages) {
			await memoryQueue.deleteMessage(msg.msg_id);
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
				await memoryQueue.archiveMessage(msg.msg_id);
			}
			return;
		}
		throw error;
	}
}

export async function processMemoryQueue(): Promise<void> {
	const logger = await getLogger("processMemoryQueue");

	const messages = await memoryQueue.readMessagesExponentialBackoff();
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
