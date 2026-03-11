"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import {
	userEmailSchema,
	userFirstNameSchema,
	userLastNameSchema,
	userRoleSchema,
} from "../schema";
import { UserTag } from "../tag";
import { editUser } from "./edit-user";

export const editUserAction = createServerAction((params) => editUser(params), {
	name: "editUserAction",
	onSuccess: ({ input: { userId } }) => {
		updateTag(UserTag.List);
		updateTag(UserTag.Detail(userId));

		redirect(`/users/${userId}`);
	},
	role: [UserRole.Admin],
	schema: v.object({
		authUserId: v.string(),
		email: userEmailSchema,
		firstName: userFirstNameSchema,
		lastName: userLastNameSchema,
		originalRole: v.string(),
		role: userRoleSchema,
		userId: v.string(),
	}),
});
