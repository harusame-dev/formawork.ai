"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { TaskTag } from "../tag";
import { registerTask } from "./register-task";
import { registerTaskSchema } from "./schema";

export const registerTaskAction = createServerAction(registerTask, {
	name: "registerTaskAction",
	onSuccess: ({ input }) => {
		updateTag(TaskTag.List(input.projectId));
	},
	role: [UserRole.Admin, UserRole.User],
	schema: registerTaskSchema,
});
