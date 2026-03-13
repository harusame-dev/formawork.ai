"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { ProjectTag } from "@/features/project/tag";
import { TaskActivityTag } from "@/features/task-activity/tag";
import { createServerAction } from "@/libs/create-server-action";
import { TaskTag } from "../tag";
import { updateTaskStatus, updateTaskStatusSchema } from "./update-task-status";

export const updateTaskStatusAction = createServerAction(updateTaskStatus, {
	name: "updateTaskStatusAction",
	onSuccess: ({ input }) => {
		updateTag(TaskTag.All);
		updateTag(TaskTag.List(input.projectId));
		updateTag(TaskTag.Detail(input.taskId));
		updateTag(ProjectTag.List);
		updateTag(ProjectTag.Detail(input.projectId));
		updateTag(TaskActivityTag.List(input.taskId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: updateTaskStatusSchema,
});
