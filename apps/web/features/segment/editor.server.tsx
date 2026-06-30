import type React from "react";
import { notFound } from "next/navigation";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { canEditProject, getProjectAccess } from "@/features/project/authz";
import { Editor } from "./editor.client";
import { getWorkSegments } from "./get-work-segments";

export async function EditorContainer({
  projectIdPromise,
  workIdPromise,
}: {
  projectIdPromise: Promise<string>;
  workIdPromise: Promise<string>;
}): Promise<React.JSX.Element> {
  const [projectId, workId] = await Promise.all([
    projectIdPromise,
    workIdPromise,
  ]);
  const userId = await getUserStaffId();

  if (!userId) {
    notFound();
  }

  const access = await getProjectAccess(projectId, userId);

  if (!access) {
    notFound();
  }

  const data = await getWorkSegments(workId);

  if (!data || data.work.projectId !== projectId) {
    notFound();
  }

  return (
    <Editor
      canEdit={canEditProject(access)}
      initialSegments={data.segments}
      projectId={projectId}
      workId={workId}
      workName={data.work.name}
    />
  );
}
