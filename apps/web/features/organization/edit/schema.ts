import * as v from "valibot";
import {
	organizationCategoryIdSchema,
	organizationDescriptionSchema,
	organizationEmailSchema,
	organizationIdSchema,
	organizationNameSchema,
	organizationUrlSchema,
} from "../schema";

export const editOrganizationSchema = v.object({
	categoryId: organizationCategoryIdSchema,
	description: organizationDescriptionSchema,
	email: organizationEmailSchema,
	name: organizationNameSchema,
	organizationId: organizationIdSchema,
	url: organizationUrlSchema,
});

export type EditOrganizationParams = v.InferOutput<
	typeof editOrganizationSchema
>;
