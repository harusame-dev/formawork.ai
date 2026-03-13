import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { staffsTable } from "@workspace/db/schema/staff";
import { tasksTable } from "@workspace/db/schema/tasks";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "../tag";

type ProjectDetail = {
	archivedAt: Date | null;
	assigneeId: string | null;
	assigneeName: string | null;
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
			assigneeId: projectsTable.assigneeId,
			assigneeName: sql<
				string | null
			>`CASE WHEN ${staffsTable.staffId} IS NULL THEN NULL ELSE ${staffsTable.lastName} || ${staffsTable.firstName} END`,
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
		.leftJoin(staffsTable, eq(projectsTable.assigneeId, staffsTable.staffId))
		.leftJoin(tasksTable, eq(projectsTable.projectId, tasksTable.projectId))
		.where(eq(projectsTable.projectId, projectId))
		.groupBy(projectsTable.projectId, staffsTable.staffId)
		.limit(1);

	return project;
}
