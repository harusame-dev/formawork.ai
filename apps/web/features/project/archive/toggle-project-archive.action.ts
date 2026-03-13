"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { TaskTag } from "@/features/task/tag";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "../tag";
import { toggleProjectArchive } from "./toggle-project-archive";

const toggleProjectArchiveSchema = v.object({
	projectId: v.pipe(v.string(), v.uuid()),
});

export const toggleProjectArchiveAction = createServerAction(
	async (input, _context) => {
		return toggleProjectArchive(input.projectId);
	},
	{
		name: "toggleProjectArchiveAction",
		onSuccess: ({ input }) => {
			updateTag(ProjectTag.Detail(input.projectId));
			updateTag(ProjectTag.List);
			updateTag(TaskTag.All);
		},
		role: [UserRole.Admin, UserRole.User],
		schema: toggleProjectArchiveSchema,
	},
);
