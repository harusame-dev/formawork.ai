import type React from "react";
import type { ProjectVisibility } from "@workspace/db/schema/project";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import {
  canEditProject,
  canManageProject,
  getProjectAccess,
} from "@/features/project/authz";
import { MembersCardSkeleton } from "@/features/project/members/members-card-skeleton.universal";
import { MembersCardContainer } from "@/features/project/members/members-card.server";
import { UploadWorkButton } from "@/features/work/import/upload-work-button.client";
import { WorksContainer } from "@/features/work/list/works.server";
import { WorksSkeleton } from "@/features/work/list/works-skeleton.universal";
import { ProjectHeaderPresenter } from "./project-header.universal";

export async function ProjectDetailContainer({
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

  const canEdit = canEditProject(access);
  const canManage = canManageProject(access);
  const project = {
    description: access.project.description,
    id: access.project.id,
    name: access.project.name,
    ownerUserId: access.project.ownerUserId,
    visibility: access.project.visibility as ProjectVisibility,
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4">
      <div className="text-sm text-muted-foreground">
        <Link className="text-primary underline" href="/projects">
          プロジェクト
        </Link>{" "}
        / {project.name}
      </div>

      <ProjectHeaderPresenter
        canEdit={canEdit}
        canManage={canManage}
        project={project}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">ワーク</h2>
          {canEdit && <UploadWorkButton projectId={projectId} />}
        </div>
        <Suspense fallback={<WorksSkeleton />}>
          <WorksContainer projectId={projectId} />
        </Suspense>
      </section>

      <Suspense fallback={<MembersCardSkeleton />}>
        <MembersCardContainer
          canManage={canManage}
          ownerUserId={project.ownerUserId}
          projectId={projectId}
        />
      </Suspense>
    </div>
  );
}
