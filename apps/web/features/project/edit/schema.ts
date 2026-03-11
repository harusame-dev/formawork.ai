import * as v from "valibot";
import {
	projectDescriptionSchema,
	projectDueDateSchema,
	projectNameSchema,
} from "../schema";

export const editProjectSchema = v.object({
	assigneeId: v.pipe(v.string(), v.uuid()),
	description: v.optional(projectDescriptionSchema),
	dueDate: projectDueDateSchema,
	name: projectNameSchema,
	projectId: v.pipe(v.string(), v.uuid()),
});

export type EditProjectInput = v.InferOutput<typeof editProjectSchema>;
