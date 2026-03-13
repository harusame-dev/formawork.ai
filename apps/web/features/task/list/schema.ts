import { succeed } from "@harusame0616/result";
import * as v from "valibot";

const statusPicklist = v.picklist(["todo", "in_progress", "done"] as const);

// searchParams で string | string[] になる値を常に配列に正規化する
const optionalStringArray = v.optional(
	v.pipe(
		v.union([v.string(), v.array(v.string())]),
		v.transform((val) => (Array.isArray(val) ? val : [val])),
	),
);

export const tasksConditionSchema = v.object({
	assigneeIds: v.optional(v.array(v.string())),
	dueDateFrom: v.optional(v.string()),
	dueDateTo: v.optional(v.string()),
	keyword: v.optional(v.pipe(v.string(), v.maxLength(300))),
	projectIds: v.optional(v.array(v.string())),
	statuses: v.optional(v.array(statusPicklist)),
});

const tasksConditionSearchParamsSchema = v.object({
	assigneeIds: optionalStringArray,
	dueDateFrom: v.optional(v.string()),
	dueDateTo: v.optional(v.string()),
	keyword: v.optional(v.pipe(v.string(), v.maxLength(300))),
	projectIds: optionalStringArray,
	statuses: v.optional(
		v.pipe(
			v.union([v.string(), v.array(v.string())]),
			v.transform((val) => (Array.isArray(val) ? val : [val])),
			v.array(statusPicklist),
		),
	),
});

export type TasksCondition = v.InferOutput<typeof tasksConditionSchema>;

export function parseTasksConditionSearchParams(value: unknown) {
	const result = v.safeParse(tasksConditionSearchParamsSchema, value);
	return result.success ? succeed(result.output) : succeed({});
}
