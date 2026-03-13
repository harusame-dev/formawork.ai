import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskActivitiesTable } from "@workspace/db/schema/task-activities";
import type { PostTaskCommentInput } from "./schema";

type PostTaskCommentContext = {
	role: string;
	userId: string;
};

export async function postTaskComment(
	input: PostTaskCommentInput,
	context: PostTaskCommentContext,
): Promise<Result<undefined, never>> {
	await db.insert(taskActivitiesTable).values({
		authorId: context.userId,
		content: input.content,
		taskId: input.taskId,
		type: "comment",
	});

	return succeed();
}
