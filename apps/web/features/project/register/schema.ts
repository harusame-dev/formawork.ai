import * as v from "valibot";
import {
	projectDescriptionSchema,
	projectDueDateSchema,
	projectNameSchema,
} from "../schema";

export const registerProjectSchema = v.object({
	assigneeId: v.pipe(v.string(), v.uuid()),
	description: v.optional(projectDescriptionSchema),
	dueDate: projectDueDateSchema,
	name: projectNameSchema,
});

export type RegisterProjectInput = v.InferOutput<typeof registerProjectSchema>;
