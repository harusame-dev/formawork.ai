import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { schemaName } from "@workspace/db/pgschema";
import { ADVICE_QUEUE_NAME } from "@workspace/db/queue-names";
import {
	type AdviceContent,
	customerNoteAdviceTable,
} from "@workspace/db/schema/customer-note-advice";
import { sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";
import { generateAdvice } from "./generate-advice";

const RECENT_NOTES_LIMIT = 10;
const MAX_RETRY_COUNT = 3;

type QueueMessage = {
	msg_id: number;
	read_ct: number;
	message: {
		customerNoteId: string;
	};
};

type RecentNote = {
	content: string;
	createdAt: Date;
};

type NoteWithRecentNotes = {
	content: string;
	customerId: string;
	firstName: string;
	id: string;
	lastName: string;
	recentNotes: RecentNote[] | null;
};

async function readMessagesFromQueue(): Promise<QueueMessage[]> {
	return db.execute<QueueMessage>(sql`
		SELECT * FROM pgmq.read(${ADVICE_QUEUE_NAME}, 30, 10)
	`);
}

async function fetchNotesWithRecentNotes(
	customerNoteIds: string[],
): Promise<NoteWithRecentNotes[]> {
	return db.execute<NoteWithRecentNotes>(sql`
		SELECT
			cn.id,
			cn.customer_id as "customerId",
			cn.content,
			c.first_name as "firstName",
			c.last_name as "lastName",
			(
				SELECT COALESCE(json_agg(
					json_build_object('content', rn.content, 'createdAt', rn.created_at)
					ORDER BY rn.created_at DESC
				), '[]'::json)
				FROM (
					SELECT content, created_at
					FROM ${sql.identifier(schemaName)}.customer_notes
					WHERE customer_id = cn.customer_id
						AND created_at < cn.created_at
					ORDER BY created_at DESC
					LIMIT ${RECENT_NOTES_LIMIT}
				) rn
			) as "recentNotes"
		FROM ${sql.identifier(schemaName)}.customer_notes cn
		INNER JOIN ${sql.identifier(schemaName)}.customers c ON cn.customer_id = c.customer_id
		WHERE cn.id IN (${sql.join(
			customerNoteIds.map((id) => sql`${id}::uuid`),
			sql`, `,
		)})
	`);
}

async function archiveMessage(msgId: number): Promise<void> {
	await db.execute(
		sql.raw(`SELECT * FROM pgmq.archive('${ADVICE_QUEUE_NAME}', ${msgId})`),
	);
}

async function deleteMessage(msgId: number): Promise<void> {
	await db.execute(
		sql.raw(`SELECT * FROM pgmq.delete('${ADVICE_QUEUE_NAME}', ${msgId})`),
	);
}

async function saveAdvice(
	customerNoteId: string,
	advice: AdviceContent,
): Promise<void> {
	await db.insert(customerNoteAdviceTable).values({
		advice,
		customerNoteId,
	});
}

async function processMessage(
	msg: QueueMessage,
	noteMap: Map<string, NoteWithRecentNotes>,
): Promise<void> {
	const logger = await getLogger("generateAdviceCron");
	const { customerNoteId } = msg.message;

	logger.info("メッセージの処理開始", {
		customerNoteId,
		readCount: msg.read_ct,
	});

	// リトライ回数超過チェック
	if (msg.read_ct > MAX_RETRY_COUNT) {
		logger.error("最大リトライ回数超過のためアーカイブ", {
			customerNoteId,
			msgId: msg.msg_id,
			readCount: msg.read_ct,
		});
		await archiveMessage(msg.msg_id);
		return;
	}

	const note = noteMap.get(customerNoteId);

	if (!note) {
		logger.warn("ノートなしのためアーカイブ", {
			customerNoteId,
			msgId: msg.msg_id,
		});
		await archiveMessage(msg.msg_id);
		return;
	}

	const recentNotes = (note.recentNotes ?? []).map((n) => ({
		content: n.content,
		createdAt: new Date(n.createdAt),
	}));

	const advice = await generateAdvice({
		customer: { firstName: note.firstName, lastName: note.lastName },
		noteContent: note.content,
		recentNotes,
	});

	await saveAdvice(customerNoteId, advice);
	revalidateTag(CustomerTag.NoteCrud(note.customerId), { expire: 0 });
	await deleteMessage(msg.msg_id);
}

export async function processAdviceQueue(): Promise<void> {
	const logger = await getLogger("processAdviceQueue");

	const messages = await readMessagesFromQueue();
	logger.info("メッセージ読み取り", {
		messages,
	});

	if (messages.length === 0) {
		logger.info("メッセージ０件のため終了");
		return;
	}

	const customerNoteIds = messages.map((msg) => msg.message.customerNoteId);
	logger.info("メッセージの処理を開始", {
		customerNoteIds,
	});

	const notes = await fetchNotesWithRecentNotes(customerNoteIds);
	const noteMap = new Map<string, NoteWithRecentNotes>(
		notes.map((note) => [note.id, note]),
	);

	const results = await Promise.allSettled(
		messages.map((msg) => processMessage(msg, noteMap)),
	);

	const failures = results
		.map((r, i) =>
			r.status === "rejected" ? { index: i, reason: r.reason } : null,
		)
		.filter((f): f is { index: number; reason: unknown } => f !== null);

	if (failures.length > 0) {
		for (const failure of failures) {
			const msg = messages[failure.index];
			if (msg) {
				logger.error("メッセージ処理失敗", {
					customerNoteId: msg.message.customerNoteId,
					err: failure.reason,
					msgId: msg.msg_id,
				});
			}
		}
		logger.warn("一部の処理に失敗", {
			failed: failures.length,
			total: messages.length,
		});
	}
}
