import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectAssigneesTable } from "@workspace/db/schema/project-assignees";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import type { EditProjectInput } from "./schema";

const PROJECT_NOT_FOUND_ERROR_MESSAGE =
	"指定されたプロジェクトが見つかりません" as const;

type EditProjectErrorMessage = typeof PROJECT_NOT_FOUND_ERROR_MESSAGE;

export async function editProject(
	input: EditProjectInput,
): Promise<Result<undefined, EditProjectErrorMessage>> {
	const result = await db
		.update(projectsTable)
		.set({
			description: input.description,
			dueDate: input.dueDate,
			name: input.name,
		})
		.where(eq(projectsTable.projectId, input.projectId))
		.returning({ projectId: projectsTable.projectId });

	if (!result.length) {
		return fail(PROJECT_NOT_FOUND_ERROR_MESSAGE);
	}

	// 担当者を洗い替え
	await db
		.delete(projectAssigneesTable)
		.where(eq(projectAssigneesTable.projectId, input.projectId));

	if (input.assigneeIds.length > 0) {
		await db.insert(projectAssigneesTable).values(
			input.assigneeIds.map((staffId) => ({
				projectId: input.projectId,
				staffId,
			})),
		);
	}

	return succeed();
}
