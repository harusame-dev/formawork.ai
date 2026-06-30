import { type Success, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import {
  ProjectMemberRole,
  projectMembersTable,
  projectsTable,
} from "@workspace/db/schema/project";
import { v7 as uuidv7 } from "uuid";
import type { RegisterProjectParams } from "./schema";

export async function registerProject({
  description,
  name,
  ownerUserId,
  visibility,
}: RegisterProjectParams & {
  ownerUserId: string;
}): Promise<Success<{ projectId: string }>> {
  const projectId = uuidv7();

  await db.transaction(async (tx) => {
    await tx.insert(projectsTable).values({
      description,
      id: projectId,
      name,
      ownerUserId,
      visibility,
    });

    // 作成者を Owner としてメンバー登録
    await tx.insert(projectMembersTable).values({
      projectId,
      role: ProjectMemberRole.Owner,
      userId: ownerUserId,
    });
  });

  return succeed({ projectId });
}
