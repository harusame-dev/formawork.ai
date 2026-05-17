"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { OrganizationTag } from "../tag";
import { registerOrganization } from "./register-organization";
import { registerOrganizationSchema } from "./schema";

export const registerOrganizationAction = createServerAction(
	registerOrganization,
	{
		name: "registerOrganizationAction",
		onSuccess: () => {
			updateTag(OrganizationTag.List);
			redirect("/organizations");
		},
		role: [UserRole.Admin],
		schema: registerOrganizationSchema,
	},
);
