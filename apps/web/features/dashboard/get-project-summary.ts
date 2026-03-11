import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { tasksTable } from "@workspace/db/schema/tasks";
import { sql } from "drizzle-orm";

type ProjectSummary = {
	projectTotal: number;
	taskSummary: {
		done: number;
		inProgress: number;
		todo: number;
	};
};

export async function getProjectSummary(): Promise<ProjectSummary> {
	const [projectTotal, taskCounts] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(projectsTable)
			.then((result) => Number(result[0]?.count ?? 0)),
		db
			.select({
				count: sql<number>`count(*)`,
				status: tasksTable.status,
			})
			.from(tasksTable)
			.groupBy(tasksTable.status),
	]);

	const taskSummary = {
		done: 0,
		inProgress: 0,
		todo: 0,
	};

	for (const row of taskCounts) {
		const count = Number(row.count);
		if (row.status === "done") {
			taskSummary.done = count;
		} else if (row.status === "in_progress") {
			taskSummary.inProgress = count;
		} else if (row.status === "todo") {
			taskSummary.todo = count;
		}
	}

	return { projectTotal, taskSummary };
}
