"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { organizationIdSchema } from "../schema";
import { OrganizationTag } from "../tag";
import { deleteOrganization } from "./delete-organization";

const deleteOrganizationSchema = v.object({
	organizationId: organizationIdSchema,
});

export const deleteOrganizationAction = createServerAction(deleteOrganization, {
	name: "deleteOrganizationAction",
	onSuccess: ({ input }) => {
		updateTag(OrganizationTag.List);
		updateTag(OrganizationTag.Detail(input.organizationId));
		redirect("/organizations");
	},
	role: [UserRole.Admin],
	schema: deleteOrganizationSchema,
});
