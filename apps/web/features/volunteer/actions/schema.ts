import * as v from "valibot";

export const GENDER_OPTIONS = ["男性", "女性", "その他", "未回答"] as const;

export const createVolunteerSchema = v.object({
	code: v.pipe(
		v.string("IDを入力してください"),
		v.nonEmpty("IDを入力してください"),
		v.regex(/^\d{6}$/, "IDは数字6桁で入力してください"),
	),
	eventId: v.pipe(v.string(), v.uuid()),
	gender: v.optional(v.picklist(GENDER_OPTIONS)),
	name: v.pipe(
		v.string("氏名を入力してください"),
		v.nonEmpty("氏名を入力してください"),
		v.maxLength(100, "氏名は100文字以内で入力してください"),
	),
	participationDates: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.regex(
					/^\d{4}-\d{2}-\d{2}$/,
					"日付はYYYY-MM-DD形式で入力してください",
				),
			),
		),
		v.minLength(1, "参加予定日を1日以上選択してください"),
	),
});

export const updateVolunteerSchema = v.object({
	code: v.pipe(
		v.string("IDを入力してください"),
		v.nonEmpty("IDを入力してください"),
		v.regex(/^\d{6}$/, "IDは数字6桁で入力してください"),
	),
	eventId: v.pipe(v.string(), v.uuid()),
	gender: v.optional(v.picklist(GENDER_OPTIONS)),
	name: v.pipe(
		v.string("氏名を入力してください"),
		v.nonEmpty("氏名を入力してください"),
		v.maxLength(100, "氏名は100文字以内で入力してください"),
	),
	participationDates: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.regex(
					/^\d{4}-\d{2}-\d{2}$/,
					"日付はYYYY-MM-DD形式で入力してください",
				),
			),
		),
		v.minLength(1, "参加予定日を1日以上選択してください"),
	),
	volunteerId: v.pipe(v.string(), v.uuid()),
});

export type CreateVolunteerParams = v.InferOutput<typeof createVolunteerSchema>;
export type UpdateVolunteerParams = v.InferOutput<typeof updateVolunteerSchema>;
