"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { TaskTag } from "../tag";
import { editTask } from "./edit-task";
import { editTaskSchema } from "./schema";

export const editTaskAction = createServerAction(editTask, {
	name: "editTaskAction",
	onSuccess: ({ input }) => {
		updateTag(TaskTag.All);
		updateTag(TaskTag.List(input.projectId));
		updateTag(TaskTag.Detail(input.taskId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: editTaskSchema,
});
