import { db } from "@workspace/db/client";
import { chatTodosTable } from "@workspace/db/schema/chat-todo";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

type ExtractedTodo = {
	description: string;
	priority: number;
	suggestedCategoryId: string | null;
	title: string;
};

// LLM が抽出した TODO 群を差分マージする
// - 同じタイトルの TODO は description / priority / category を更新
// - done（完了状態）は本処理で上書きしない（チェックボックス / ツール経由でのみ変更）
// - 既存にあって新しい抽出にない TODO は残す（手動完了状態の保持）
export async function upsertTodos({
	chatId,
	todos,
}: {
	chatId: string;
	todos: ExtractedTodo[];
}): Promise<void> {
	if (todos.length === 0) {
		return;
	}

	const existing = await db
		.select({
			title: chatTodosTable.title,
			todoId: chatTodosTable.todoId,
		})
		.from(chatTodosTable)
		.where(eq(chatTodosTable.chatId, chatId));

	const existingByTitle = new Map(existing.map((t) => [t.title, t.todoId]));
	const inserts: (typeof chatTodosTable.$inferInsert)[] = [];

	for (const todo of todos) {
		const existingId = existingByTitle.get(todo.title);
		if (existingId) {
			await db
				.update(chatTodosTable)
				.set({
					description: todo.description,
					priority: todo.priority,
					suggestedCategoryId: todo.suggestedCategoryId,
				})
				.where(eq(chatTodosTable.todoId, existingId));
		} else {
			inserts.push({
				chatId,
				description: todo.description,
				priority: todo.priority,
				suggestedCategoryId: todo.suggestedCategoryId,
				title: todo.title,
				todoId: uuidv7(),
			});
		}
	}

	if (inserts.length > 0) {
		await db.insert(chatTodosTable).values(inserts);
	}
}
