import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskCommentsTable } from "@workspace/db/schema/task-comments";
import { eq } from "drizzle-orm";
import type { EditTaskCommentInput } from "./schema";

type EditTaskCommentContext = {
	role: string;
	userId: string;
};

export async function editTaskComment(
	input: EditTaskCommentInput,
	context: EditTaskCommentContext,
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

	const result = await db
		.update(taskCommentsTable)
		.set({ content: input.content })
		.where(eq(taskCommentsTable.commentId, input.commentId))
		.returning({ commentId: taskCommentsTable.commentId });

	if (!result.length) {
		return fail("指定されたコメントが見つかりません");
	}

	return succeed();
}
