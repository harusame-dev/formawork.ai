import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskActivitiesTable } from "@workspace/db/schema/task-activities";
import { asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskActivityTag } from "../tag";

export type TaskActivity = {
	activityId: string;
	authorId: string;
	authorName: string | null;
	content: string | null;
	createdAt: Date;
	metadata: unknown;
	taskId: string;
	type: string;
	updatedAt: Date;
};

export async function getTaskActivities(
	taskId: string,
): Promise<TaskActivity[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(TaskActivityTag.List(taskId));

	const activities = await db
		.select({
			activityId: taskActivitiesTable.activityId,
			authorId: taskActivitiesTable.authorId,
			authorName: sql<
				string | null
			>`CASE WHEN ${staffsTable.staffId} IS NULL THEN NULL ELSE ${staffsTable.lastName} || ${staffsTable.firstName} END`,
			content: taskActivitiesTable.content,
			createdAt: taskActivitiesTable.createdAt,
			metadata: taskActivitiesTable.metadata,
			taskId: taskActivitiesTable.taskId,
			type: taskActivitiesTable.type,
			updatedAt: taskActivitiesTable.updatedAt,
		})
		.from(taskActivitiesTable)
		.leftJoin(
			staffsTable,
			eq(taskActivitiesTable.authorId, staffsTable.staffId),
		)
		.where(eq(taskActivitiesTable.taskId, taskId))
		.orderBy(asc(taskActivitiesTable.createdAt));

	return activities;
}
