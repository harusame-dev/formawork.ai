import * as v from "valibot";
import {
	taskDescriptionSchema,
	taskDueDateSchema,
	taskNameSchema,
} from "../schema";

export const registerTaskSchema = v.object({
	assigneeId: v.pipe(v.string(), v.uuid()),
	description: v.optional(taskDescriptionSchema),
	dueDate: taskDueDateSchema,
	name: taskNameSchema,
	projectId: v.pipe(v.string(), v.uuid()),
	status: v.picklist(["todo", "in_progress", "done"]),
});

export type RegisterTaskInput = v.InferOutput<typeof registerTaskSchema>;
