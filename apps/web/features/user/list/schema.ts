import { succeed } from "@harusame0616/result";
import * as v from "valibot";

export const USER_SEARCH_KEYWORD_MAX_LENGTH = 300;

const keywordSchema = v.pipe(
	v.string(),
	v.maxLength(USER_SEARCH_KEYWORD_MAX_LENGTH),
);

const pageSchema = v.pipe(v.number(), v.minValue(1));

export const usersConditionSchema = v.object({
	keyword: keywordSchema,
	page: pageSchema,
});

const usersConditionSearchParamsSchema = v.object({
	keyword: v.optional(keywordSchema, ""),
	page: v.optional(v.pipe(v.string(), v.transform(Number), pageSchema), "1"),
});

export type UsersConditionSearchParams = v.InferOutput<
	typeof usersConditionSearchParamsSchema
>;

export type UsersCondition = v.InferOutput<typeof usersConditionSchema>;

export function parseUsersConditionSearchParams(value: unknown) {
	const result = v.safeParse(usersConditionSearchParamsSchema, value);

	return result.success
		? succeed(result.output)
		: succeed({ keyword: "", page: 1 });
}

export type UsersListItem = {
	email: string;
	firstName: string;
	lastName: string;
	userId: string;
};
