import { db } from "@workspace/db/client";
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "../tag";

type ProjectDetail = {
	archivedAt: Date | null;
	assignees: { id: string; name: string }[];
	createdAt: Date;
	description: string | null;
	doneTasks: number;
	dueDate: string | null;
	name: string;
	projectId: string;
	totalTasks: number;
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
			assignees: sql<
				{ id: string; name: string }[]
			>`(SELECT COALESCE(json_agg(json_build_object('id', s.staff_id, 'name', s.last_name || s.first_name)), '[]') FROM ${projectAssigneesTable} pa JOIN ${staffsTable} s ON pa.staff_id = s.staff_id WHERE pa.project_id = ${projectsTable.projectId})`,
			createdAt: projectsTable.createdAt,
			description: projectsTable.description,
			doneTasks: sql<number>`count(CASE WHEN ${tasksTable.status} = 'done' THEN 1 END)::int`,
			dueDate: projectsTable.dueDate,
			name: projectsTable.name,
			projectId: projectsTable.projectId,
			totalTasks: sql<number>`count(${tasksTable.taskId})::int`,
			updatedAt: projectsTable.updatedAt,
		})
		.from(projectsTable)
		.leftJoin(tasksTable, eq(projectsTable.projectId, tasksTable.projectId))
		.where(eq(projectsTable.projectId, projectId))
		.groupBy(projectsTable.projectId)
		.limit(1);

	return project;
}
