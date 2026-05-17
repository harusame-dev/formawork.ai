import * as v from "valibot";
import {
	organizationCategoryIdSchema,
	organizationDescriptionSchema,
	organizationEmailSchema,
	organizationNameSchema,
	organizationUrlSchema,
} from "../schema";

export const registerOrganizationSchema = v.object({
	categoryId: organizationCategoryIdSchema,
	description: organizationDescriptionSchema,
	email: organizationEmailSchema,
	name: organizationNameSchema,
	url: organizationUrlSchema,
});

export type RegisterOrganizationParams = v.InferOutput<
	typeof registerOrganizationSchema
>;

export const newOrganizationSearchParamsSchema = v.object({
	categoryId: v.fallback(v.optional(v.pipe(v.string(), v.uuid())), undefined),
});
