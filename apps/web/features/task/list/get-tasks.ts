import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskTag } from "../tag";

export type TaskListItem = {
	assigneeId: string | null;
	assigneeName: string | null;
	description: string | null;
	dueDate: string | null;
	name: string;
	projectId: string;
	status: string;
	taskId: string;
};

export async function getTasks(projectId: string): Promise<TaskListItem[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(TaskTag.List(projectId));

	const tasks = await db
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
		.where(eq(tasksTable.projectId, projectId))
		.orderBy(desc(tasksTable.createdAt));

	return tasks;
}
