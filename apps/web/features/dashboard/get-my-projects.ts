import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { asc, eq, isNull } from "drizzle-orm";
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
		.where(eq(projectsTable.assigneeId, staffId))
		.orderBy(asc(isNull(projectsTable.dueDate)), asc(projectsTable.dueDate))
		.limit(5);

	return projects;
}
