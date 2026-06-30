import type React from "react";
import { getCandidateUsers } from "./get-candidate-users";
import { getProjectMembers } from "./get-project-members";
import { MembersCard } from "./members-card.client";

export async function MembersCardContainer({
  canManage,
  ownerUserId,
  projectId,
}: {
  canManage: boolean;
  ownerUserId: string;
  projectId: string;
}): Promise<React.JSX.Element> {
  const [members, candidates] = await Promise.all([
    getProjectMembers(projectId),
    canManage ? getCandidateUsers() : Promise.resolve([]),
  ]);

  return (
    <MembersCard
      candidates={candidates}
      canManage={canManage}
      members={members}
      ownerUserId={ownerUserId}
      projectId={projectId}
    />
  );
}
