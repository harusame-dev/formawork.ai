"use server";

import { updateTag } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "../tag";
import { deleteProject } from "./delete-project";

const deleteProjectSchema = v.object({
	projectId: v.pipe(v.string(), v.uuid()),
});

export const deleteProjectAction = createServerAction(
	async (input, _context) => {
		const deletedBy = await getUserStaffId();
		return deleteProject({ deletedBy, projectId: input.projectId });
	},
	{
		name: "deleteProjectAction",
		onSuccess: () => {
			updateTag(ProjectTag.List);
			redirect("/projects", RedirectType.replace);
		},
		role: [UserRole.Admin, UserRole.User],
		schema: deleteProjectSchema,
	},
);
