import { db } from "@workspace/db/client";
import type { ProjectMemberRole } from "@workspace/db/schema/project";
import { projectMembersTable } from "@workspace/db/schema/project";
import { staffsTable } from "@workspace/db/schema/staff";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { ProjectTag } from "@/features/project/tag";

export interface ProjectMemberItem {
  name: string;
  role: ProjectMemberRole;
  userId: string;
}

export async function getProjectMembers(
  projectId: string,
): Promise<ProjectMemberItem[]> {
  "use cache";
  cacheLife("permanent");
  cacheTag(ProjectTag.MembersByProjectId(projectId));

  const rows = await db
    .select({
      firstName: staffsTable.firstName,
      lastName: staffsTable.lastName,
      role: projectMembersTable.role,
      userId: projectMembersTable.userId,
    })
    .from(projectMembersTable)
    .innerJoin(staffsTable, eq(staffsTable.staffId, projectMembersTable.userId))
    .where(eq(projectMembersTable.projectId, projectId))
    .orderBy(asc(projectMembersTable.role), asc(staffsTable.lastName));

  return rows.map((row) => ({
    name: `${row.lastName} ${row.firstName}`,
    role: row.role as ProjectMemberRole,
    userId: row.userId,
  }));
}
