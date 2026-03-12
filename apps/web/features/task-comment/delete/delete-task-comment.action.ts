"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { TaskCommentTag } from "../tag";
import { deleteTaskComment } from "./delete-task-comment";

const deleteTaskCommentSchema = v.object({
	commentId: v.pipe(v.string(), v.uuid()),
	taskId: v.pipe(v.string(), v.uuid()),
});

export const deleteTaskCommentAction = createServerAction(deleteTaskComment, {
	name: "deleteTaskCommentAction",
	onSuccess: ({ input }) => {
		updateTag(TaskCommentTag.List(input.taskId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: deleteTaskCommentSchema,
});
