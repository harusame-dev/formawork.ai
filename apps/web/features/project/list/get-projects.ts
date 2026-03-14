import { db } from "@workspace/db/client";
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { and, desc, eq, exists, ilike, isNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "../tag";
import type { ProjectsCondition, ProjectsListItem } from "./schema";

type GetProjectsResult = {
	page: number;
	projects: ProjectsListItem[];
	totalPages: number;
};

export async function getProjects({
	assigneeId,
	includeArchived,
	keyword,
	page,
}: ProjectsCondition): Promise<GetProjectsResult> {
	"use cache";
	cacheLife("permanent");
	cacheTag(ProjectTag.List);

	const pageSize = 20;

	const assigneeFilter = assigneeId
		? exists(
				db
					.select({ one: sql`1` })
					.from(projectAssigneesTable)
					.where(
						and(
							eq(projectAssigneesTable.projectId, projectsTable.projectId),
							eq(projectAssigneesTable.staffId, assigneeId),
						),
					),
			)
		: undefined;

	const whereConditions = and(
		keyword ? ilike(projectsTable.name, `%${keyword}%`) : undefined,
		assigneeFilter,
		includeArchived ? undefined : isNull(projectsTable.archivedAt),
	);

	const projects = await db
		.select({
			archivedAt: projectsTable.archivedAt,
			assignees: sql<
				{ id: string; name: string }[]
			>`COALESCE(json_agg(json_build_object('id', ${staffsTable.staffId}, 'name', ${staffsTable.lastName} || ${staffsTable.firstName})) FILTER (WHERE ${staffsTable.staffId} IS NOT NULL), '[]')`,
			createdAt: projectsTable.createdAt,
			doneTasks: sql<number>`count(CASE WHEN ${tasksTable.status} = 'done' THEN 1 END)::int`,
			dueDate: projectsTable.dueDate,
			name: projectsTable.name,
			projectId: projectsTable.projectId,
			totalTasks: sql<number>`count(${tasksTable.taskId})::int`,
		})
		.from(projectsTable)
		.leftJoin(
			projectAssigneesTable,
			eq(projectsTable.projectId, projectAssigneesTable.projectId),
		)
		.leftJoin(
			staffsTable,
			eq(projectAssigneesTable.staffId, staffsTable.staffId),
		)
		.leftJoin(tasksTable, eq(projectsTable.projectId, tasksTable.projectId))
		.where(whereConditions)
		.groupBy(projectsTable.projectId)
		.orderBy(desc(projectsTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(projectsTable)
		.where(whereConditions)
		.then((result) => Number(result[0]?.count ?? 0));

	return {
		page,
		projects,
		totalPages: Math.ceil(total / pageSize),
	};
}
