import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import type { RegisterProjectInput } from "./schema";

type RegisterProjectResult = {
	projectId: string;
};

export async function registerProject(
	input: RegisterProjectInput,
): Promise<Result<RegisterProjectResult, never>> {
	const [project] = await db
		.insert(projectsTable)
		.values({
			assigneeId: input.assigneeId,
			description: input.description,
			dueDate: input.dueDate,
			name: input.name,
		})
		.returning({ projectId: projectsTable.projectId });

	if (!project) {
		throw new Error("案件の登録に失敗しました");
	}
	return succeed({ projectId: project.projectId });
}
