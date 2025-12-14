import { type DbExecutor, db } from "@workspace/db/client";
import { sql } from "drizzle-orm";

const VISIBILITY_TIMEOUT_SECONDS = 30;
const READ_QUANTITY = 100;

/** Exponential backoff で実行する read_ct の値（1, 2, 4, 8） */
const EXPONENTIAL_BACKOFF_READ_COUNTS = new Set([1, 2, 4, 8]);
/** この回数以上 read されたメッセージは自動アーカイブ */
const MAX_READ_COUNT_BEFORE_ARCHIVE = 9;

export type PgmqMessage<T> = {
	msg_id: number;
	read_ct: number;
	message: T;
};

export class PgmqQueue<TMessage> {
	private readonly queueName: string;
	private readonly executor: DbExecutor;

	constructor(queueName: string, executor: DbExecutor = db) {
		this.queueName = queueName;
		this.executor = executor;
	}

	async readMessages(): Promise<PgmqMessage<TMessage>[]> {
		return this.executor.execute<PgmqMessage<TMessage>>(sql`
			SELECT * FROM pgmq.read(${this.queueName}::text, ${VISIBILITY_TIMEOUT_SECONDS}::integer, ${READ_QUANTITY}::integer)
		`);
	}

	async sendMessage(payload: TMessage): Promise<void> {
		await this.executor.execute(sql`
			SELECT pgmq.send(${this.queueName}::text, ${JSON.stringify(payload)}::jsonb)
		`);
	}

	async deleteMessage(msgId: number): Promise<void> {
		await this.executor.execute(sql`
			SELECT * FROM pgmq.delete(${this.queueName}::text, ${msgId}::bigint)
		`);
	}

	async archiveMessage(msgId: number): Promise<void> {
		await this.executor.execute(sql`
			SELECT * FROM pgmq.archive(${this.queueName}::text, ${msgId}::bigint)
		`);
	}

	/**
	 * Exponential backoff を適用してメッセージを読み取る
	 *
	 * read_ct が 1, 2, 4, 8 の場合のみメッセージを返す（それ以外はスキップ）
	 * read_ct が 9 以上のメッセージは自動でアーカイブする
	 *
	 * @returns 処理対象のメッセージのみを返す
	 */
	async readMessagesExponentialBackoff(): Promise<PgmqMessage<TMessage>[]> {
		const messages = await this.readMessages();

		const result: PgmqMessage<TMessage>[] = [];

		for (const msg of messages) {
			if (msg.read_ct >= MAX_READ_COUNT_BEFORE_ARCHIVE) {
				// 9回以上読み取られたメッセージは自動アーカイブ
				await this.archiveMessage(msg.msg_id);
				continue;
			}

			if (EXPONENTIAL_BACKOFF_READ_COUNTS.has(msg.read_ct)) {
				// 1, 2, 4, 8 回目のみ処理対象として返す
				result.push(msg);
			}
			// それ以外（3, 5, 6, 7）はスキップ（次回の cron で再度 read される）
		}

		return result;
	}
}
