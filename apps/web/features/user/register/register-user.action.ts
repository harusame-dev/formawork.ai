"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { UserTag } from "../tag";
import { registerUser } from "./register-user";
import { registerUserSchema } from "./schema";

export const registerUserAction = createServerAction(registerUser, {
	name: "registerUserAction",
	onSuccess: () => {
		revalidateTag(UserTag.List, "max");

		redirect("/users");
	},
	role: [UserRole.Admin],
	schema: registerUserSchema,
});
