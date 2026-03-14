import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskAssigneesTable } from "@workspace/db/schema/task-assignees";
import { tasksTable } from "@workspace/db/schema/tasks";
import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskTag } from "../tag";

export type TaskListItem = {
	assignees: { id: string; name: string }[];
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
			assignees: sql<
				{ id: string; name: string }[]
			>`COALESCE(json_agg(json_build_object('id', ${staffsTable.staffId}, 'name', ${staffsTable.lastName} || ${staffsTable.firstName})) FILTER (WHERE ${staffsTable.staffId} IS NOT NULL), '[]')`,
			description: tasksTable.description,
			dueDate: tasksTable.dueDate,
			name: tasksTable.name,
			projectId: tasksTable.projectId,
			status: tasksTable.status,
			taskId: tasksTable.taskId,
		})
		.from(tasksTable)
		.leftJoin(
			taskAssigneesTable,
			eq(tasksTable.taskId, taskAssigneesTable.taskId),
		)
		.leftJoin(staffsTable, eq(taskAssigneesTable.staffId, staffsTable.staffId))
		.where(eq(tasksTable.projectId, projectId))
		.groupBy(tasksTable.taskId)
		.orderBy(desc(tasksTable.createdAt));

	return tasks;
}
