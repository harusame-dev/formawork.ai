"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import {
	staffEmailSchema,
	staffFirstNameSchema,
	staffLastNameSchema,
	staffRoleSchema,
} from "../schema";
import { StaffTag } from "../tag";
import { editStaff } from "./edit-staff";

export const editStaffAction = createServerAction(
	(params) => editStaff(params),
	{
		name: "editStaffAction",
		onSuccess: ({ input: { staffId } }) => {
			updateTag(StaffTag.List);
			updateTag(StaffTag.Detail(staffId));

			redirect(`/staffs/${staffId}`);
		},
		role: [UserRole.Admin],
		schema: v.object({
			authUserId: v.string(),
			email: staffEmailSchema,
			firstName: staffFirstNameSchema,
			lastName: staffLastNameSchema,
			originalRole: v.string(),
			role: staffRoleSchema,
			staffId: v.string(),
		}),
	},
);
