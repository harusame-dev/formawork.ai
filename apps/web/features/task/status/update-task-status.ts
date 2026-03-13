import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskActivitiesTable } from "@workspace/db/schema/task-activities";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import * as v from "valibot";

export const updateTaskStatusSchema = v.object({
	projectId: v.pipe(v.string(), v.uuid()),
	status: v.picklist(["todo", "in_progress", "done"]),
	taskId: v.pipe(v.string(), v.uuid()),
});

type UpdateTaskStatusInput = v.InferOutput<typeof updateTaskStatusSchema>;

type UpdateTaskStatusContext = {
	role: string;
	userId: string;
};

export async function updateTaskStatus(
	input: UpdateTaskStatusInput,
	context: UpdateTaskStatusContext,
): Promise<Result<undefined, never>> {
	const [task] = await db
		.select({ status: tasksTable.status })
		.from(tasksTable)
		.where(eq(tasksTable.taskId, input.taskId))
		.limit(1);

	const previousStatus = task?.status;

	await db
		.update(tasksTable)
		.set({ status: input.status })
		.where(eq(tasksTable.taskId, input.taskId));

	if (previousStatus !== undefined && previousStatus !== input.status) {
		await db.insert(taskActivitiesTable).values({
			authorId: context.userId,
			metadata: { from: previousStatus, to: input.status },
			taskId: input.taskId,
			type: "status_changed",
		});
	}

	return succeed();
}
