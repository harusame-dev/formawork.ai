"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { TaskCommentTag } from "../tag";
import { editTaskComment } from "./edit-task-comment";
import { editTaskCommentSchema } from "./schema";

export const editTaskCommentAction = createServerAction(editTaskComment, {
	name: "editTaskCommentAction",
	onSuccess: ({ input }) => {
		updateTag(TaskCommentTag.List(input.taskId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: editTaskCommentSchema,
});
