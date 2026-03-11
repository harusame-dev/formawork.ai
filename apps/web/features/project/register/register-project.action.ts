"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "../tag";
import { registerProject } from "./register-project";
import { registerProjectSchema } from "./schema";

export const registerProjectAction = createServerAction(registerProject, {
	name: "registerProjectAction",
	onSuccess: () => {
		updateTag(ProjectTag.List);
		redirect("/projects");
	},
	role: [UserRole.Admin, UserRole.User],
	schema: registerProjectSchema,
});
