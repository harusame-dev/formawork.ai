import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "../../project/tag";

export type ProjectOption = {
	name: string;
	projectId: string;
};

export async function getProjectOptions(): Promise<ProjectOption[]> {
	"use cache";
	cacheLife("permanent");
	cacheTag(ProjectTag.List);

	const projects = await db
		.select({
			name: projectsTable.name,
			projectId: projectsTable.projectId,
		})
		.from(projectsTable)
		.orderBy(asc(projectsTable.name));

	return projects;
}
