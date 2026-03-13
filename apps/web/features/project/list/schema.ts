import { succeed } from "@harusame0616/result";
import * as v from "valibot";

const pageSchema = v.pipe(v.number(), v.minValue(1));
const keywordSchema = v.pipe(v.string(), v.maxLength(300));

export const projectsConditionSchema = v.object({
	assigneeId: v.optional(v.string()),
	includeArchived: v.optional(v.boolean()),
	keyword: v.optional(keywordSchema),
	page: pageSchema,
});

const projectsConditionSearchParamsSchema = v.object({
	assigneeId: v.optional(v.string()),
	includeArchived: v.optional(
		v.pipe(
			v.string(),
			v.transform((v) => v === "true"),
		),
	),
	keyword: v.optional(keywordSchema),
	page: v.optional(v.pipe(v.string(), v.transform(Number), pageSchema), "1"),
});

export type ProjectsCondition = v.InferOutput<typeof projectsConditionSchema>;

export type ProjectsListItem = {
	archivedAt: Date | null;
	assigneeName: string | null;
	createdAt: Date;
	dueDate: string | null;
	name: string;
	projectId: string;
};

export function parseProjectsConditionSearchParams(value: unknown) {
	const result = v.safeParse(projectsConditionSearchParamsSchema, value);

	return result.success ? succeed(result.output) : succeed({ page: 1 });
}
