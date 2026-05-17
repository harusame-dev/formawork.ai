import * as v from "valibot";

export const requestConsultationSchema = v.object({
	chatId: v.pipe(
		v.string("チャットを指定してください"),
		v.uuid("チャットを指定してください"),
	),
	contactEmail: v.optional(
		v.pipe(
			v.string(),
			v.email("正しいメールアドレス形式で入力してください"),
			v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
		),
	),
	targetOrgId: v.pipe(
		v.string("組織を指定してください"),
		v.uuid("組織を指定してください"),
	),
	todoId: v.optional(v.pipe(v.string(), v.uuid("TODO を指定してください"))),
});

export type RequestConsultationParams = v.InferOutput<
	typeof requestConsultationSchema
>;
