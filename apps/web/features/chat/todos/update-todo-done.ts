import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { chatTodosTable } from "@workspace/db/schema/chat-todo";
import { and, eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { ChatTag } from "@/features/chat/tag";

const TODO_NOT_FOUND = "対象のタスクが見つかりません" as const;

type ErrorMessage = typeof TODO_NOT_FOUND;

export async function updateTodoDone({
	chatId,
	done,
	todoId,
}: {
	chatId: string;
	done: boolean;
	todoId: string;
}): Promise<Result<{ todoId: string }, ErrorMessage>> {
	const result = await db
		.update(chatTodosTable)
		.set({ done })
		.where(
			and(eq(chatTodosTable.todoId, todoId), eq(chatTodosTable.chatId, chatId)),
		)
		.returning({ todoId: chatTodosTable.todoId });

	const updated = result[0];
	if (!updated) {
		return fail(TODO_NOT_FOUND);
	}

	revalidateTag(ChatTag.Todos(chatId), "permanent");
	return succeed({ todoId: updated.todoId });
}

export async function setTodosDoneByIds({
	chatId,
	done,
	todoIds,
}: {
	chatId: string;
	done: boolean;
	todoIds: string[];
}): Promise<{ updatedTodoIds: string[] }> {
	if (todoIds.length === 0) {
		return { updatedTodoIds: [] };
	}

	const result = await db
		.update(chatTodosTable)
		.set({ done })
		.where(
			and(
				eq(chatTodosTable.chatId, chatId),
				inArray(chatTodosTable.todoId, todoIds),
			),
		)
		.returning({ todoId: chatTodosTable.todoId });

	if (result.length > 0) {
		revalidateTag(ChatTag.Todos(chatId), "permanent");
	}

	return { updatedTodoIds: result.map((r) => r.todoId) };
}
