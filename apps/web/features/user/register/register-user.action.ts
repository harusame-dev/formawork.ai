"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { UserTag } from "../tag";
import { registerUser } from "./register-user";
import { registerUserSchema } from "./schema";

export const registerUserAction = createServerAction(registerUser, {
	name: "registerUserAction",
	onSuccess: () => {
		updateTag(UserTag.List);
	},
	role: [UserRole.Admin],
	schema: registerUserSchema,
});
