import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectsTable } from "@workspace/db/schema/projects";
import { eq } from "drizzle-orm";
import type { EditProjectInput } from "./schema";

const PROJECT_NOT_FOUND_ERROR_MESSAGE =
	"指定された案件が見つかりません" as const;

type EditProjectErrorMessage = typeof PROJECT_NOT_FOUND_ERROR_MESSAGE;

export async function editProject(
	input: EditProjectInput,
): Promise<Result<undefined, EditProjectErrorMessage>> {
	const result = await db
		.update(projectsTable)
		.set({
			assigneeId: input.assigneeId,
			description: input.description,
			dueDate: input.dueDate,
			name: input.name,
		})
		.where(eq(projectsTable.projectId, input.projectId))
		.returning({ projectId: projectsTable.projectId });

	if (!result.length) {
		return fail(PROJECT_NOT_FOUND_ERROR_MESSAGE);
	}

	return succeed();
}
