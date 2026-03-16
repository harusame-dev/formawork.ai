import * as v from "valibot";

export const eventFormSchema = v.object({
	description: v.optional(v.pipe(v.string(), v.trim())),
	eventDates: v.pipe(
		v.array(
			v.pipe(
				v.string("開催日を入力してください"),
				v.regex(
					/^\d{4}-\d{2}-\d{2}$/,
					"開催日は YYYY-MM-DD 形式で入力してください",
				),
			),
		),
		v.minLength(1, "開催日を1日以上選択してください"),
	),
	name: v.pipe(
		v.string("イベント名を入力してください"),
		v.nonEmpty("イベント名を入力してください"),
		v.maxLength(100, "イベント名は100文字以内で入力してください"),
	),
});

export type EventFormParams = v.InferOutput<typeof eventFormSchema>;
