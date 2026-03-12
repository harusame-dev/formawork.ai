import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskTag } from "../tag";

export type TaskDetail = {
	assigneeId: string | null;
	assigneeName: string | null;
	description: string | null;
	dueDate: string | null;
	name: string;
	projectId: string;
	status: string;
	taskId: string;
};

export async function getTaskDetail(
	taskId: string,
): Promise<TaskDetail | undefined> {
	"use cache";
	cacheLife("permanent");
	cacheTag(TaskTag.Detail(taskId));

	const [task] = await db
		.select({
			assigneeId: tasksTable.assigneeId,
			assigneeName: sql<
				string | null
			>`CASE WHEN ${staffsTable.staffId} IS NULL THEN NULL ELSE ${staffsTable.lastName} || ${staffsTable.firstName} END`,
			description: tasksTable.description,
			dueDate: tasksTable.dueDate,
			name: tasksTable.name,
			projectId: tasksTable.projectId,
			status: tasksTable.status,
			taskId: tasksTable.taskId,
		})
		.from(tasksTable)
		.leftJoin(staffsTable, eq(tasksTable.assigneeId, staffsTable.staffId))
		.where(eq(tasksTable.taskId, taskId))
		.limit(1);

	return task;
}
