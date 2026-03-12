import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskCommentsTable } from "@workspace/db/schema/task-comments";
import { asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskCommentTag } from "../tag";

export type TaskComment = {
	authorId: string;
	authorName: string | null;
	commentId: string;
	content: string;
	createdAt: Date;
	taskId: string;
	updatedAt: Date;
};

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(TaskCommentTag.List(taskId));

	const comments = await db
		.select({
			authorId: taskCommentsTable.authorId,
			authorName: sql<
				string | null
			>`CASE WHEN ${staffsTable.staffId} IS NULL THEN NULL ELSE ${staffsTable.lastName} || ${staffsTable.firstName} END`,
			commentId: taskCommentsTable.commentId,
			content: taskCommentsTable.content,
			createdAt: taskCommentsTable.createdAt,
			taskId: taskCommentsTable.taskId,
			updatedAt: taskCommentsTable.updatedAt,
		})
		.from(taskCommentsTable)
		.leftJoin(staffsTable, eq(taskCommentsTable.authorId, staffsTable.staffId))
		.where(eq(taskCommentsTable.taskId, taskId))
		.orderBy(asc(taskCommentsTable.createdAt));

	return comments;
}
