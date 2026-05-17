import * as v from "valibot";
import {
	userEmailSchema,
	userOrganizationIdSchema,
	userRoleSchema,
} from "../schema";

export const registerUserSchema = v.object({
	email: userEmailSchema,
	organizationId: userOrganizationIdSchema,
	role: userRoleSchema,
});

export type RegisterUserParams = v.InferOutput<typeof registerUserSchema>;
