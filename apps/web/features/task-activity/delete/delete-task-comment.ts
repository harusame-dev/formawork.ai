import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskActivitiesTable } from "@workspace/db/schema/task-activities";
import { and, eq } from "drizzle-orm";

type DeleteTaskCommentInput = {
	activityId: string;
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
	const [activity] = await db
		.select({ authorId: taskActivitiesTable.authorId })
		.from(taskActivitiesTable)
		.where(
			and(
				eq(taskActivitiesTable.activityId, input.activityId),
				eq(taskActivitiesTable.type, "comment"),
			),
		)
		.limit(1);

	if (!activity) {
		return fail("指定されたコメントが見つかりません");
	}

	if (activity.authorId !== context.userId && context.role !== "admin") {
		return fail("この操作を実行する権限がありません");
	}

	await db
		.delete(taskActivitiesTable)
		.where(
			and(
				eq(taskActivitiesTable.activityId, input.activityId),
				eq(taskActivitiesTable.type, "comment"),
			),
		);

	return succeed();
}
