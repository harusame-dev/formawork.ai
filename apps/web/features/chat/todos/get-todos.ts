import { db } from "@workspace/db/client";
import { chatTodosTable } from "@workspace/db/schema/chat-todo";
import { asc, eq } from "drizzle-orm";

export type ChatTodo = {
	chatId: string;
	description: string;
	done: boolean;
	priority: number;
	suggestedCategoryId: string | null;
	title: string;
	todoId: string;
};

export async function getChatTodos(chatId: string): Promise<ChatTodo[]> {
	return db
		.select({
			chatId: chatTodosTable.chatId,
			description: chatTodosTable.description,
			done: chatTodosTable.done,
			priority: chatTodosTable.priority,
			suggestedCategoryId: chatTodosTable.suggestedCategoryId,
			title: chatTodosTable.title,
			todoId: chatTodosTable.todoId,
		})
		.from(chatTodosTable)
		.where(eq(chatTodosTable.chatId, chatId))
		.orderBy(asc(chatTodosTable.priority), asc(chatTodosTable.createdAt));
}
