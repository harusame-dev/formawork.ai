"use server";

import { fail } from "@harusame0616/result";
import { updateTag } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { UserTag } from "@/features/user/tag";
import { createServerAction } from "@/libs/create-server-action";
import { deleteUser } from "./delete-user";

const deleteUserSchema = v.object({
	userId: v.pipe(v.string(), v.uuid()),
});

export const deleteUserAction = createServerAction(
	async ({ userId }) => {
		const currentUserId = await getUserStaffId();

		if (!currentUserId) {
			return fail("認証に失敗しました");
		}

		return deleteUser({ currentUserId, userId });
	},
	{
		name: "deleteUserAction",
		onSuccess: ({ input: { userId } }) => {
			updateTag(UserTag.Detail(userId));
			updateTag(UserTag.List);

			redirect("/users", RedirectType.replace);
		},
		role: [UserRole.Admin],
		schema: deleteUserSchema,
	},
);
