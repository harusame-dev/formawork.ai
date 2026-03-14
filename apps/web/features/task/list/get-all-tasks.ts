import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { taskAssigneesTable } from "@workspace/db/schema/task-assignees";
import { tasksTable } from "@workspace/db/schema/tasks";
import {
	and,
	desc,
	eq,
	exists,
	gte,
	ilike,
	inArray,
	isNull,
	lte,
	sql,
} from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TaskTag } from "../tag";
import type { TasksCondition } from "./schema";

export type AllTaskListItem = {
	assignees: { id: string; name: string }[];
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

	const {
		assigneeIds,
		dueDateFrom,
		dueDateTo,
		includeArchived,
		keyword,
		projectIds,
		statuses,
	} = condition;

	const assigneeFilter = assigneeIds?.length
		? exists(
				db
					.select({ one: sql`1` })
					.from(taskAssigneesTable)
					.where(
						and(
							eq(taskAssigneesTable.taskId, tasksTable.taskId),
							inArray(taskAssigneesTable.staffId, assigneeIds),
						),
					),
			)
		: undefined;

	const where = and(
		keyword ? ilike(tasksTable.name, `%${keyword}%`) : undefined,
		projectIds?.length ? inArray(tasksTable.projectId, projectIds) : undefined,
		statuses?.length ? inArray(tasksTable.status, statuses) : undefined,
		assigneeFilter,
		dueDateFrom ? gte(tasksTable.dueDate, dueDateFrom) : undefined,
		dueDateTo ? lte(tasksTable.dueDate, dueDateTo) : undefined,
		includeArchived ? undefined : isNull(projectsTable.archivedAt),
	);

	const tasks = await db
		.select({
			assignees: sql<
				{ id: string; name: string }[]
			>`COALESCE(json_agg(json_build_object('id', ${staffsTable.staffId}, 'name', ${staffsTable.lastName} || ${staffsTable.firstName})) FILTER (WHERE ${staffsTable.staffId} IS NOT NULL), '[]')`,
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
		.leftJoin(
			taskAssigneesTable,
			eq(tasksTable.taskId, taskAssigneesTable.taskId),
		)
		.leftJoin(staffsTable, eq(taskAssigneesTable.staffId, staffsTable.staffId))
		.where(where)
		.groupBy(tasksTable.taskId, projectsTable.name)
		.orderBy(desc(tasksTable.createdAt));

	return tasks;
}
