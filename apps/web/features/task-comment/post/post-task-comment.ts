import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskCommentsTable } from "@workspace/db/schema/task-comments";
import type { PostTaskCommentInput } from "./schema";

type PostTaskCommentContext = {
	role: string;
	userId: string;
};

export async function postTaskComment(
	input: PostTaskCommentInput,
	context: PostTaskCommentContext,
): Promise<Result<undefined, never>> {
	await db.insert(taskCommentsTable).values({
		authorId: context.userId,
		content: input.content,
		taskId: input.taskId,
	});

	return succeed();
}
