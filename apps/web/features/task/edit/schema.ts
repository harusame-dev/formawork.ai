import * as v from "valibot";
import {
	taskDescriptionSchema,
	taskDueDateSchema,
	taskNameSchema,
} from "../schema";

export const editTaskSchema = v.object({
	assigneeIds: v.array(v.pipe(v.string(), v.uuid())),
	description: v.optional(taskDescriptionSchema),
	dueDate: taskDueDateSchema,
	name: taskNameSchema,
	projectId: v.pipe(v.string(), v.uuid()),
	status: v.picklist(["todo", "in_progress", "done"]),
	taskId: v.pipe(v.string(), v.uuid()),
});

export type EditTaskInput = v.InferOutput<typeof editTaskSchema>;
