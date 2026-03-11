import * as v from "valibot";
import {
	userEmailSchema,
	userFirstNameSchema,
	userLastNameSchema,
	userRoleSchema,
} from "../schema";

const editUserSchema = v.object({
	email: userEmailSchema,
	firstName: userFirstNameSchema,
	lastName: userLastNameSchema,
	role: userRoleSchema,
});

export type EditUserParams = v.InferOutput<typeof editUserSchema>;
