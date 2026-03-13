import * as v from "valibot";

export const editTaskCommentSchema = v.object({
	activityId: v.pipe(v.string(), v.uuid()),
	content: v.pipe(
		v.string(),
		v.minLength(1, "コメントを入力してください"),
		v.maxLength(1000, "コメントは1000文字以内で入力してください"),
	),
	taskId: v.pipe(v.string(), v.uuid()),
});

export type EditTaskCommentInput = v.InferOutput<typeof editTaskCommentSchema>;
