import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { projectMembersTable } from "@workspace/db/schema/project";
import { canManageProject, getProjectAccess } from "@/features/project/authz";
import type { AddMemberParams } from "./schema";

const PROJECT_NOT_FOUND_ERROR = "プロジェクトが見つかりません" as const;
const FORBIDDEN_ERROR = "この操作を実行する権限がありません" as const;

type ErrorMessage = typeof PROJECT_NOT_FOUND_ERROR | typeof FORBIDDEN_ERROR;

export async function addMember({
  operatorUserId,
  projectId,
  role,
  userId,
}: AddMemberParams & {
  operatorUserId: string;
}): Promise<Result<undefined, ErrorMessage>> {
  const access = await getProjectAccess(projectId, operatorUserId);

  if (!access) {
    return fail(PROJECT_NOT_FOUND_ERROR);
  }

  if (!canManageProject(access)) {
    return fail(FORBIDDEN_ERROR);
  }

  await db
    .insert(projectMembersTable)
    .values({ projectId, role, userId })
    .onConflictDoUpdate({
      set: { role },
      target: [projectMembersTable.projectId, projectMembersTable.userId],
    });

  return succeed();
}
