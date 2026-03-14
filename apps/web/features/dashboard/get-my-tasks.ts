import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { taskAssigneesTable } from "@workspace/db/schema/task-assignees";
import { tasksTable } from "@workspace/db/schema/tasks";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
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
		.innerJoin(
			taskAssigneesTable,
			eq(tasksTable.taskId, taskAssigneesTable.taskId),
		)
		.where(
			and(
				eq(taskAssigneesTable.staffId, staffId),
				isNull(projectsTable.archivedAt),
				inArray(tasksTable.status, ["todo", "in_progress"]),
			),
		)
		.orderBy(asc(isNull(tasksTable.dueDate)), asc(tasksTable.dueDate))
		.limit(20);

	return tasks;
}
