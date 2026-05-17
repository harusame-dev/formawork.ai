"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { userIdSchema } from "../schema";
import { UserTag } from "../tag";
import { deleteUser } from "./delete-user";

const deleteUserSchema = v.object({
	userId: userIdSchema,
});

export const deleteUserAction = createServerAction(deleteUser, {
	name: "deleteUserAction",
	onSuccess: ({ input }) => {
		updateTag(UserTag.List);
		updateTag(UserTag.Detail(input.userId));
		redirect("/users");
	},
	role: [UserRole.Admin],
	schema: deleteUserSchema,
});
