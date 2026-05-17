import * as v from "valibot";

export const organizationNameSchema = v.pipe(
	v.string("組織名を入力してください"),
	v.minLength(1, "組織名を入力してください"),
	v.maxLength(64, "組織名は64文字以内で入力してください"),
);

// 通知先メールアドレスは任意。空文字なら空文字のまま保存（NOT NULL は維持）。
// 値が入っている場合のみ email 形式・文字数を検証する。
export const organizationEmailSchema = v.union([
	v.literal(""),
	v.pipe(
		v.string("正しいメールアドレス形式で入力してください"),
		v.email("正しいメールアドレス形式で入力してください"),
		v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
	),
]);

export const organizationCategoryIdSchema = v.pipe(
	v.string("カテゴリーを選択してください"),
	v.uuid("カテゴリーを選択してください"),
);

export const organizationIdSchema = v.pipe(
	v.string("組織を指定してください"),
	v.uuid("組織を指定してください"),
);

export const organizationDescriptionSchema = v.pipe(
	v.string("会社概要を入力してください"),
	v.maxLength(1000, "会社概要は1000文字以内で入力してください"),
);

// URL は任意。空文字なら空文字のまま保存。値が入っている場合のみ URL 形式・文字数を検証。
export const organizationUrlSchema = v.union([
	v.literal(""),
	v.pipe(
		v.string("正しいURL形式で入力してください"),
		v.url("正しいURL形式で入力してください"),
		v.maxLength(2048, "URLは2048文字以内で入力してください"),
	),
]);
