import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { canManageProject, getProjectAccess } from "@/features/project/authz";
import { getCandidateUsers } from "./get-candidate-users";
import { getProjectMembers } from "./get-project-members";
import { MembersCard } from "./members-card.client";

export async function ProjectMembersContainer({
  projectIdPromise,
}: {
  projectIdPromise: Promise<string>;
}): Promise<React.JSX.Element> {
  const projectId = await projectIdPromise;
  const userId = await getUserStaffId();

  if (!userId) {
    notFound();
  }

  const access = await getProjectAccess(projectId, userId);

  if (!access) {
    notFound();
  }

  const canManage = canManageProject(access);
  const [members, candidates] = await Promise.all([
    getProjectMembers(projectId),
    canManage ? getCandidateUsers() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <Link className="text-primary underline" href="/projects">
          プロジェクト
        </Link>{" "}
        /{" "}
        <Link
          className="text-primary underline"
          href={`/projects/${projectId}`}
        >
          {access.project.name}
        </Link>{" "}
        / メンバー
      </div>

      <MembersCard
        candidates={candidates}
        canManage={canManage}
        members={members}
        ownerUserId={access.project.ownerUserId}
        projectId={projectId}
      />
    </div>
  );
}
