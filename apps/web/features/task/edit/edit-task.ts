import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import type { EditTaskInput } from "./schema";

const TASK_NOT_FOUND_ERROR_MESSAGE =
	"指定されたタスクが見つかりません" as const;

type EditTaskErrorMessage = typeof TASK_NOT_FOUND_ERROR_MESSAGE;

export async function editTask(
	input: EditTaskInput,
): Promise<Result<undefined, EditTaskErrorMessage>> {
	const result = await db
		.update(tasksTable)
		.set({
			assigneeId: input.assigneeId,
			description: input.description,
			dueDate: input.dueDate,
			name: input.name,
			status: input.status,
		})
		.where(eq(tasksTable.taskId, input.taskId))
		.returning({ taskId: tasksTable.taskId });

	if (!result.length) {
		return fail(TASK_NOT_FOUND_ERROR_MESSAGE);
	}

	return succeed();
}
