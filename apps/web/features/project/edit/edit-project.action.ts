"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "../tag";
import { editProject } from "./edit-project";
import { editProjectSchema } from "./schema";

export const editProjectAction = createServerAction(editProject, {
	name: "editProjectAction",
	onSuccess: ({ input }) => {
		updateTag(ProjectTag.Detail(input.projectId));
		updateTag(ProjectTag.List);
		redirect(`/projects/${input.projectId}`);
	},
	role: [UserRole.Admin, UserRole.User],
	schema: editProjectSchema,
});
