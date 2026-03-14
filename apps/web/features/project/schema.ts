import * as v from "valibot";

export const projectNameSchema = v.pipe(
	v.string(),
	v.minLength(1, "プロジェクト名を入力してください"),
	v.maxLength(100, "プロジェクト名は100文字以内で入力してください"),
);

export const projectDescriptionSchema = v.pipe(
	v.string(),
	v.maxLength(1000, "詳細は1000文字以内で入力してください"),
);

export const projectDueDateSchema = v.optional(
	v.pipe(v.string(), v.isoDate("日付の形式が正しくありません")),
);
