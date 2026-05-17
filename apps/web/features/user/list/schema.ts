import * as v from "valibot";

export const usersConditionSchema = v.object({
	page: v.optional(
		v.fallback(
			v.pipe(
				v.union([v.string(), v.number()]),
				v.transform((value) => Number(value)),
				v.number(),
				v.minValue(1),
			),
			1,
		),
		1,
	),
});

export type UsersCondition = v.InferOutput<typeof usersConditionSchema>;
