import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { tasksTable } from "@workspace/db/schema/tasks";
import type { RegisterTaskInput } from "./schema";

export async function registerTask(
	input: RegisterTaskInput,
): Promise<Result<undefined, never>> {
	await db.insert(tasksTable).values({
		assigneeId: input.assigneeId,
		description: input.description,
		dueDate: input.dueDate,
		name: input.name,
		projectId: input.projectId,
		status: input.status,
	});

	return succeed();
}
