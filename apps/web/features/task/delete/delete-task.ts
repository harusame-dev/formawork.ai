import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { recordDeletion } from "@/features/deletion-log/record-deletion";

const TASK_NOT_FOUND_ERROR_MESSAGE =
	"指定されたタスクが見つかりません" as const;

type DeleteTaskErrorMessage = typeof TASK_NOT_FOUND_ERROR_MESSAGE;

type DeleteTaskInput = {
	deletedBy: string | null;
	projectId: string;
	taskId: string;
};

export async function deleteTask({
	deletedBy,
	projectId: _projectId,
	taskId,
}: DeleteTaskInput): Promise<Result<undefined, DeleteTaskErrorMessage>> {
	const [task] = await db
		.select()
		.from(tasksTable)
		.where(eq(tasksTable.taskId, taskId))
		.limit(1);

	if (!task) {
		return fail(TASK_NOT_FOUND_ERROR_MESSAGE);
	}

	await recordDeletion({
		deletedBy,
		deletedData: task as Record<string, unknown>,
		recordId: taskId,
		tableName: "tasks",
	});

	await db.delete(tasksTable).where(eq(tasksTable.taskId, taskId));

	return succeed();
}
