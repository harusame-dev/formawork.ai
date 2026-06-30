import type React from "react";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { GlossaryTable } from "@/features/glossary/glossary-table.universal";
import { RegisterGlossaryDialog } from "@/features/glossary/register/register-glossary-dialog.client";
import { canEditProject, getProjectAccess } from "@/features/project/authz";
import { getProjectGlossaries } from "./get-project-glossaries";

export async function ProjectGlossaryContainer({
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
  const glossaries = await getProjectGlossaries(projectId);

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
        / 用語集
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-bold">用語集</h1>
          <p className="text-sm text-muted-foreground">
            このプロジェクト固有の用語集です。共通用語集と合わせて AI 英訳の
            ヒントに使われます。
          </p>
        </div>
        {canEdit && <RegisterGlossaryDialog projectId={projectId} />}
      </div>

      <Card className="p-4">
        <GlossaryTable canEdit={canEdit} glossaries={glossaries} />
      </Card>
    </div>
  );
}
