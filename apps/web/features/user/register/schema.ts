import * as v from "valibot";
import {
	userEmailSchema,
	userFirstNameSchema,
	userLastNameSchema,
	userPasswordSchema,
	userRoleSchema,
} from "../schema";

export const registerUserSchema = v.object({
	email: userEmailSchema,
	firstName: userFirstNameSchema,
	lastName: userLastNameSchema,
	password: userPasswordSchema,
	role: userRoleSchema,
});

export type RegisterUserParams = v.InferOutput<typeof registerUserSchema>;
