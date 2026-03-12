import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskTag } from "../tag";

export type AllTaskListItem = {
	assigneeId: string | null;
	assigneeName: string | null;
	description: string | null;
	dueDate: string | null;
	name: string;
	projectId: string;
	projectName: string;
	status: string;
	taskId: string;
};

export async function getAllTasks(): Promise<AllTaskListItem[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(TaskTag.All);

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
			projectName: projectsTable.name,
			status: tasksTable.status,
			taskId: tasksTable.taskId,
		})
		.from(tasksTable)
		.innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.projectId))
		.leftJoin(staffsTable, eq(tasksTable.assigneeId, staffsTable.staffId))
		.orderBy(desc(tasksTable.createdAt));

	return tasks;
}
