import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { tasksTable } from "@workspace/db/schema/tasks";
import { asc, eq, isNull } from "drizzle-orm";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

type MyTask = {
	dueDate: string | null;
	name: string;
	projectId: string;
	projectName: string;
	status: string;
	taskId: string;
};

export async function getMyTasks(): Promise<MyTask[]> {
	const staffId = await getUserStaffId();
	if (!staffId) {
		return [];
	}

	const tasks = await db
		.select({
			dueDate: tasksTable.dueDate,
			name: tasksTable.name,
			projectId: tasksTable.projectId,
			projectName: projectsTable.name,
			status: tasksTable.status,
			taskId: tasksTable.taskId,
		})
		.from(tasksTable)
		.innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.projectId))
		.where(eq(tasksTable.assigneeId, staffId))
		.orderBy(asc(isNull(tasksTable.dueDate)), asc(tasksTable.dueDate))
		.limit(5);

	return tasks;
}
