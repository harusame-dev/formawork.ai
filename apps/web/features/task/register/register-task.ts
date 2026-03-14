import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskAssigneesTable } from "@workspace/db/schema/task-assignees";
import { tasksTable } from "@workspace/db/schema/tasks";
import type { RegisterTaskInput } from "./schema";

export async function registerTask(
	input: RegisterTaskInput,
): Promise<Result<undefined, never>> {
	const [task] = await db
		.insert(tasksTable)
		.values({
			description: input.description,
			dueDate: input.dueDate,
			name: input.name,
			projectId: input.projectId,
			status: input.status,
		})
		.returning({ taskId: tasksTable.taskId });

	if (!task) {
		throw new Error("タスクの登録に失敗しました");
	}

	if (input.assigneeIds.length > 0) {
		await db.insert(taskAssigneesTable).values(
			input.assigneeIds.map((staffId) => ({
				staffId,
				taskId: task.taskId,
			})),
		);
	}

	return succeed();
}
