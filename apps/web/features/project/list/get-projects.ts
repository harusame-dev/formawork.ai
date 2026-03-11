import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
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
	keyword,
	page,
}: ProjectsCondition): Promise<GetProjectsResult> {
	"use cache";
	cacheLife("permanent");
	cacheTag(ProjectTag.List);

	const pageSize = 20;

	const whereConditions = and(
		keyword ? ilike(projectsTable.name, `%${keyword}%`) : undefined,
		assigneeId ? eq(projectsTable.assigneeId, assigneeId) : undefined,
	);

	const projects = await db
		.select({
			assigneeName: sql<
				string | null
			>`CASE WHEN ${staffsTable.staffId} IS NULL THEN NULL ELSE ${staffsTable.lastName} || ${staffsTable.firstName} END`,
			createdAt: projectsTable.createdAt,
			dueDate: projectsTable.dueDate,
			name: projectsTable.name,
			projectId: projectsTable.projectId,
		})
		.from(projectsTable)
		.leftJoin(staffsTable, eq(projectsTable.assigneeId, staffsTable.staffId))
		.where(whereConditions)
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
