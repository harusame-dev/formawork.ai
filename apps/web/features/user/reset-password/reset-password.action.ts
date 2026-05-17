"use server";

import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { userIdSchema } from "../schema";
import { resetPassword } from "./reset-password";

const resetPasswordSchema = v.object({
	userId: userIdSchema,
});

export const resetPasswordAction = createServerAction(resetPassword, {
	name: "resetPasswordAction",
	role: [UserRole.Admin],
	schema: resetPasswordSchema,
});
