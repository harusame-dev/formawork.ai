import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
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
			description: input.description,
			dueDate: input.dueDate,
			name: input.name,
		})
		.returning({ projectId: projectsTable.projectId });

	if (!project) {
		throw new Error("プロジェクトの登録に失敗しました");
	}

	if (input.assigneeIds.length > 0) {
		await db.insert(projectAssigneesTable).values(
			input.assigneeIds.map((staffId) => ({
				projectId: project.projectId,
				staffId,
			})),
		);
	}

	return succeed({ projectId: project.projectId });
}
