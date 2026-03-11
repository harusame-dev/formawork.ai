"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { createServerAction } from "@/libs/create-server-action";
import { TaskTag } from "../tag";
import { deleteTask } from "./delete-task";

const deleteTaskSchema = v.object({
	projectId: v.pipe(v.string(), v.uuid()),
	taskId: v.pipe(v.string(), v.uuid()),
});

export const deleteTaskAction = createServerAction(
	async (input) => {
		const deletedBy = await getUserStaffId();
		return deleteTask({
			deletedBy,
			projectId: input.projectId,
			taskId: input.taskId,
		});
	},
	{
		name: "deleteTaskAction",
		onSuccess: ({ input }) => {
			updateTag(TaskTag.List(input.projectId));
		},
		role: [UserRole.Admin, UserRole.User],
		schema: deleteTaskSchema,
	},
);
