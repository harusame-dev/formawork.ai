import { db } from "@workspace/db/client";
import { sql } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect } from "vitest";
import { PgmqQueue } from "./queue";

const test = base.extend<{
	testQueue: { queueName: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: vitest fixture pattern
	async testQueue({}, use) {
		const queueName = `test_queue_${v4().replace(/-/g, "_")}`;

		await db.execute(sql`SELECT pgmq.create(${queueName}::text)`);

		await use({ queueName });

		await db.execute(sql`SELECT pgmq.drop_queue(${queueName}::text)`);
	},
});

test("メッセージを送信して読み取れる", async ({ testQueue }) => {
	const queue = new PgmqQueue<{ data: string }>(testQueue.queueName);
	const payload = { data: "test-message" };

	await queue.sendMessage(payload);
	const messages = await queue.readMessages();

	expect(messages).toHaveLength(1);
	expect(messages[0]?.message).toEqual(payload);
});

test("空のキューからは空配列が返る", async ({ testQueue }) => {
	const queue = new PgmqQueue<{ data: string }>(testQueue.queueName);

	const messages = await queue.readMessages();

	expect(messages).toHaveLength(0);
});

test("複数メッセージを送信して読み取れる", async ({ testQueue }) => {
	const queue = new PgmqQueue<{ index: number }>(testQueue.queueName);

	await queue.sendMessage({ index: 1 });
	await queue.sendMessage({ index: 2 });
	await queue.sendMessage({ index: 3 });

	const messages = await queue.readMessages();

	expect(messages).toHaveLength(3);
});

test("メッセージを削除できる", async ({ testQueue }) => {
	const queue = new PgmqQueue<{ data: string }>(testQueue.queueName);

	await queue.sendMessage({ data: "to-delete" });
	const [message] = await queue.readMessages();

	if (!message) throw new Error("message should be defined");
	await queue.deleteMessage(message.msg_id);

	const remaining = await queue.readMessages();
	expect(remaining).toHaveLength(0);
});

test("メッセージをアーカイブできる", async ({ testQueue }) => {
	const queue = new PgmqQueue<{ data: string }>(testQueue.queueName);

	await queue.sendMessage({ data: "to-archive" });
	const [message] = await queue.readMessages();

	if (!message) throw new Error("message should be defined");
	await queue.archiveMessage(message.msg_id);

	const remaining = await queue.readMessages();
	expect(remaining).toHaveLength(0);

	const archived = await db.execute<{ msg_id: number }>(
		sql.raw(
			`SELECT * FROM pgmq.a_${testQueue.queueName} WHERE msg_id = ${message.msg_id}`,
		),
	);
	expect(archived).toHaveLength(1);
});

test("トランザクション内で操作できる", async ({ testQueue }) => {
	const payload = { data: "tx-test" };

	await db.transaction(async (tx) => {
		const queue = new PgmqQueue<{ data: string }>(testQueue.queueName, tx);
		await queue.sendMessage(payload);
	});

	const queue = new PgmqQueue<{ data: string }>(testQueue.queueName);
	const messages = await queue.readMessages();
	expect(messages).toHaveLength(1);
	expect(messages[0]?.message).toEqual(payload);
});

test("トランザクションロールバック時はメッセージが送信されない", async ({
	testQueue,
}) => {
	try {
		await db.transaction(async (tx) => {
			const queue = new PgmqQueue<{ data: string }>(testQueue.queueName, tx);
			await queue.sendMessage({ data: "should-rollback" });
			throw new Error("Rollback");
		});
	} catch {
		// Expected
	}

	const queue = new PgmqQueue<{ data: string }>(testQueue.queueName);
	const messages = await queue.readMessages();
	expect(messages).toHaveLength(0);
});
