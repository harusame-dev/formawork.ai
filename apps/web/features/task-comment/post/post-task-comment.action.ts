"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { TaskCommentTag } from "../tag";
import { postTaskComment } from "./post-task-comment";
import { postTaskCommentSchema } from "./schema";

export const postTaskCommentAction = createServerAction(postTaskComment, {
	name: "postTaskCommentAction",
	onSuccess: ({ input }) => {
		updateTag(TaskCommentTag.List(input.taskId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: postTaskCommentSchema,
});
