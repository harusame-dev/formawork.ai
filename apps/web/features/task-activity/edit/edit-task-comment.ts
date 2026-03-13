import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { taskActivitiesTable } from "@workspace/db/schema/task-activities";
import { and, eq } from "drizzle-orm";
import type { EditTaskCommentInput } from "./schema";

type EditTaskCommentContext = {
	role: string;
	userId: string;
};

export async function editTaskComment(
	input: EditTaskCommentInput,
	context: EditTaskCommentContext,
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

	const result = await db
		.update(taskActivitiesTable)
		.set({ content: input.content })
		.where(
			and(
				eq(taskActivitiesTable.activityId, input.activityId),
				eq(taskActivitiesTable.type, "comment"),
			),
		)
		.returning({ activityId: taskActivitiesTable.activityId });

	if (!result.length) {
		return fail("指定されたコメントが見つかりません");
	}

	return succeed();
}
