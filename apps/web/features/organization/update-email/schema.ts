import * as v from "valibot";
import { organizationEmailSchema, organizationIdSchema } from "../schema";

export const updateOrganizationEmailSchema = v.object({
	email: organizationEmailSchema,
	organizationId: organizationIdSchema,
});

export type UpdateOrganizationEmailParams = v.InferOutput<
	typeof updateOrganizationEmailSchema
>;
