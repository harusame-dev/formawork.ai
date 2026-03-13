import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "../tag";

type ProjectDetail = {
	archivedAt: Date | null;
	assigneeId: string | null;
	assigneeName: string | null;
	createdAt: Date;
	description: string | null;
	dueDate: string | null;
	name: string;
	projectId: string;
	updatedAt: Date;
};

export async function getProjectDetail(
	projectId: string,
): Promise<ProjectDetail | undefined> {
	"use cache";
	cacheLife("permanent");
	cacheTag(ProjectTag.Detail(projectId));

	const [project] = await db
		.select({
			archivedAt: projectsTable.archivedAt,
			assigneeId: projectsTable.assigneeId,
			assigneeName: sql<
				string | null
			>`CASE WHEN ${staffsTable.staffId} IS NULL THEN NULL ELSE ${staffsTable.lastName} || ${staffsTable.firstName} END`,
			createdAt: projectsTable.createdAt,
			description: projectsTable.description,
			dueDate: projectsTable.dueDate,
			name: projectsTable.name,
			projectId: projectsTable.projectId,
			updatedAt: projectsTable.updatedAt,
		})
		.from(projectsTable)
		.leftJoin(staffsTable, eq(projectsTable.assigneeId, staffsTable.staffId))
		.where(eq(projectsTable.projectId, projectId))
		.limit(1);

	return project;
}
