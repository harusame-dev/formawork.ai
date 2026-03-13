import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { and, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskTag } from "../tag";
import type { TasksCondition } from "./schema";

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

export async function getAllTasks(
	condition: TasksCondition = {},
): Promise<AllTaskListItem[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(TaskTag.All);

	const { assigneeIds, dueDateFrom, dueDateTo, keyword, projectIds, statuses } =
		condition;

	const where = and(
		keyword ? ilike(tasksTable.name, `%${keyword}%`) : undefined,
		projectIds?.length ? inArray(tasksTable.projectId, projectIds) : undefined,
		statuses?.length ? inArray(tasksTable.status, statuses) : undefined,
		assigneeIds?.length
			? inArray(tasksTable.assigneeId, assigneeIds)
			: undefined,
		dueDateFrom ? gte(tasksTable.dueDate, dueDateFrom) : undefined,
		dueDateTo ? lte(tasksTable.dueDate, dueDateTo) : undefined,
	);

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
		.where(where)
		.orderBy(desc(tasksTable.createdAt));

	return tasks;
}
