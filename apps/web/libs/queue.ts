import { type DbExecutor, db } from "@workspace/db/client";
import { sql } from "drizzle-orm";

const DEFAULT_VISIBILITY_TIMEOUT_SECONDS = 30;
const DEFAULT_READ_QUANTITY = 10;

export type PgmqMessage<T> = {
	msg_id: number;
	read_ct: number;
	message: T;
};

type ReadOptions = {
	/** メッセージの可視化タイムアウト（秒） */
	visibilityTimeout?: number;
	/** 一度に読み取るメッセージ数 */
	quantity?: number;
};

export class PgmqQueue<TMessage> {
	private readonly queueName: string;
	private readonly executor: DbExecutor;

	constructor(queueName: string, executor: DbExecutor = db) {
		this.queueName = queueName;
		this.executor = executor;
	}

	async readMessages(options?: ReadOptions): Promise<PgmqMessage<TMessage>[]> {
		const visibilityTimeout =
			options?.visibilityTimeout ?? DEFAULT_VISIBILITY_TIMEOUT_SECONDS;
		const quantity = options?.quantity ?? DEFAULT_READ_QUANTITY;
		return this.executor.execute<PgmqMessage<TMessage>>(sql`
			SELECT * FROM pgmq.read(${this.queueName}::text, ${visibilityTimeout}::integer, ${quantity}::integer)
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
}
