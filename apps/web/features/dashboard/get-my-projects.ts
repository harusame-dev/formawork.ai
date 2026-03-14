import { db } from "@workspace/db/client";
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
import { projectsTable } from "@workspace/db/schema/projects";
import { tasksTable } from "@workspace/db/schema/tasks";
import { and, asc, eq, exists, inArray, isNull, not, or, sql } from "drizzle-orm";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

type MyProject = {
	dueDate: string | null;
	name: string;
	projectId: string;
};

export async function getMyProjects(): Promise<MyProject[]> {
	const staffId = await getUserStaffId();
	if (!staffId) {
		return [];
	}

	const projects = await db
		.select({
			dueDate: projectsTable.dueDate,
			name: projectsTable.name,
			projectId: projectsTable.projectId,
		})
		.from(projectsTable)
		.innerJoin(
			projectAssigneesTable,
			eq(projectsTable.projectId, projectAssigneesTable.projectId),
		)
		.where(
			and(
				eq(projectAssigneesTable.staffId, staffId),
				isNull(projectsTable.archivedAt),
				or(
					not(
						exists(
							db
								.select({ value: sql`1` })
								.from(tasksTable)
								.where(eq(tasksTable.projectId, projectsTable.projectId)),
						),
					),
					exists(
						db
							.select({ value: sql`1` })
							.from(tasksTable)
							.where(
								and(
									eq(tasksTable.projectId, projectsTable.projectId),
									inArray(tasksTable.status, ["todo", "in_progress"]),
								),
							),
					),
				),
			),
		)
		.orderBy(asc(isNull(projectsTable.dueDate)), asc(projectsTable.dueDate))
		.limit(5);

	return projects;
}
