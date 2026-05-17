"use server";

import { fail, type Result } from "@harusame0616/result";
import { updateTag } from "next/cache";
import { getUserOrganizationId } from "@/features/auth/get-user-organization-id";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { OrganizationTag } from "../tag";
import { updateOrganizationEmailSchema } from "./schema";
import { updateOrganizationEmail } from "./update-organization-email";

const FORBIDDEN = "この組織を更新する権限がありません" as const;

export const updateOrganizationEmailAction = createServerAction(
	async (input, context): Promise<Result<void, string>> => {
		if (context.role === UserRole.OrgUser) {
			const myOrgId = await getUserOrganizationId();
			if (myOrgId !== input.organizationId) {
				return fail(FORBIDDEN);
			}
		}
		return updateOrganizationEmail(input);
	},
	{
		name: "updateOrganizationEmailAction",
		onSuccess: ({ input }) => {
			updateTag(OrganizationTag.List);
			updateTag(OrganizationTag.Detail(input.organizationId));
		},
		role: [UserRole.Admin, UserRole.OrgUser],
		schema: updateOrganizationEmailSchema,
	},
);
