import * as v from "valibot";

export const postTaskCommentSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "コメントを入力してください"),
		v.maxLength(1000, "コメントは1000文字以内で入力してください"),
	),
	taskId: v.pipe(v.string(), v.uuid()),
});

export type PostTaskCommentInput = v.InferOutput<typeof postTaskCommentSchema>;
