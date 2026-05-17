"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { OrganizationTag } from "../tag";
import { editOrganization } from "./edit-organization";
import { editOrganizationSchema } from "./schema";

export const editOrganizationAction = createServerAction(editOrganization, {
	name: "editOrganizationAction",
	onSuccess: ({ input }) => {
		updateTag(OrganizationTag.List);
		updateTag(OrganizationTag.Detail(input.organizationId));
		redirect("/organizations");
	},
	role: [UserRole.Admin],
	schema: editOrganizationSchema,
});
