import { getLogger } from "@repo/logger/nextjs/server";
import { ADVICE_QUEUE_NAME } from "@workspace/db/queue-names";
import { revalidateTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";
import { type PgmqMessage, PgmqQueue } from "@/libs/queue";
import { generateServiceAdvice } from "./generate-service-advice";

type AdviceQueuePayload = {
	customerNoteId: string;
};

const adviceQueue = new PgmqQueue<AdviceQueuePayload>(ADVICE_QUEUE_NAME);

async function processMessage(
	msg: PgmqMessage<AdviceQueuePayload>,
): Promise<void> {
	const logger = await getLogger("processAdviceQueue");
	const { customerNoteId } = msg.message;

	logger.info("メッセージの処理開始", {
		customerNoteId,
		readCount: msg.read_ct,
	});

	const result = await generateServiceAdvice(customerNoteId);

	if (!result.success) {
		logger.warn("ノートなしのためアーカイブ", {
			customerNoteId,
			error: result.error,
			msgId: msg.msg_id,
		});
		await adviceQueue.archiveMessage(msg.msg_id);
		return;
	}

	revalidateTag(CustomerTag.NotesByCustomerId(result.data.customerId), {
		expire: 0,
	});
	revalidateTag(CustomerTag.LatestAdviceByCustomerNoteId(customerNoteId), {
		expire: 0,
	});
	await adviceQueue.deleteMessage(msg.msg_id);
}

export async function processAdviceQueue(): Promise<void> {
	const logger = await getLogger("processAdviceQueue");

	const messages = await adviceQueue.readMessagesExponentialBackoff();

	if (messages.length === 0) {
		logger.info("メッセージ０件のため終了");
		return;
	}
	logger.info("メッセージの処理を開始", { messages });

	const results = await Promise.allSettled(messages.map(processMessage));

	const failures = results
		.map((r, i) => {
			return r.status === "fulfilled"
				? null
				: { error: r.reason, message: messages[i] };
		})
		.filter((f) => f !== null);

	if (failures.length > 0) {
		logger.error("メッセージ処理失敗", { failures });
	}
}
