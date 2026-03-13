import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { asc, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "../../project/tag";

export type ProjectOption = {
	name: string;
	projectId: string;
};

export async function getProjectOptions(options?: {
	includeArchived?: boolean;
}): Promise<ProjectOption[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(ProjectTag.List);

	const projects = await db
		.select({
			name: projectsTable.name,
			projectId: projectsTable.projectId,
		})
		.from(projectsTable)
		.where(
			options?.includeArchived ? undefined : isNull(projectsTable.archivedAt),
		)
		.orderBy(asc(projectsTable.name));

	return projects;
}
