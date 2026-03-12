import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskCommentsTable } from "@workspace/db/schema/task-comments";
import { eq } from "drizzle-orm";

type DeleteTaskCommentInput = {
	commentId: string;
	taskId: string;
};

type DeleteTaskCommentContext = {
	role: string;
	userId: string;
};

export async function deleteTaskComment(
	input: DeleteTaskCommentInput,
	context: DeleteTaskCommentContext,
): Promise<Result<undefined, string>> {
	const [comment] = await db
		.select({ authorId: taskCommentsTable.authorId })
		.from(taskCommentsTable)
		.where(eq(taskCommentsTable.commentId, input.commentId))
		.limit(1);

	if (!comment) {
		return fail("指定されたコメントが見つかりません");
	}

	if (comment.authorId !== context.userId && context.role !== "admin") {
		return fail("この操作を実行する権限がありません");
	}

	await db
		.delete(taskCommentsTable)
		.where(eq(taskCommentsTable.commentId, input.commentId));

	return succeed();
}
