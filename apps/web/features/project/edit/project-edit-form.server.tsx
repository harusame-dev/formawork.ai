import type React from "react";
import type { ProjectVisibility } from "@workspace/db/schema/project";
import { notFound } from "next/navigation";
import { canManageProject, getProjectAccess } from "@/features/project/authz";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { ProjectForm } from "@/features/project/create/project-form.client";

export async function ProjectEditFormContainer({
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

  if (!access || !canManageProject(access)) {
    notFound();
  }

  return (
    <ProjectForm
      initialValues={{
        description: access.project.description,
        name: access.project.name,
        visibility: access.project.visibility as ProjectVisibility,
      }}
      projectId={projectId}
    />
  );
}
