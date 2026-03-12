"use server";

import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { TaskTag } from "../tag";

const updateTaskStatusSchema = v.object({
	projectId: v.pipe(v.string(), v.uuid()),
	status: v.picklist(["todo", "in_progress", "done"]),
	taskId: v.pipe(v.string(), v.uuid()),
});

async function updateTaskStatus(
	input: v.InferOutput<typeof updateTaskStatusSchema>,
): Promise<Result<undefined, never>> {
	await db
		.update(tasksTable)
		.set({ status: input.status })
		.where(eq(tasksTable.taskId, input.taskId));

	return succeed();
}

export const updateTaskStatusAction = createServerAction(updateTaskStatus, {
	name: "updateTaskStatusAction",
	onSuccess: ({ input }) => {
		updateTag(TaskTag.All);
		updateTag(TaskTag.List(input.projectId));
		updateTag(TaskTag.Detail(input.taskId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: updateTaskStatusSchema,
});
