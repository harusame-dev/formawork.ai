import * as v from "valibot";

export const taskNameSchema = v.pipe(
	v.string(),
	v.minLength(1, "タスク名を入力してください"),
	v.maxLength(100, "タスク名は100文字以内で入力してください"),
);

export const taskDescriptionSchema = v.pipe(
	v.string(),
	v.maxLength(1000, "詳細は1000文字以内で入力してください"),
);

export const taskDueDateSchema = v.optional(
	v.pipe(v.string(), v.isoDate("日付の形式が正しくありません")),
);
