import type React from "react";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectEditFormContainer } from "@/features/project/edit/project-edit-form.server";
import { ProjectEditFormSkeleton } from "@/features/project/edit/project-edit-form-skeleton.universal";

export default async function Page({
  params,
}: PageProps<"/projects/[projectId]/edit">): Promise<React.JSX.Element> {
  const projectIdPromise = params.then(({ projectId }) => projectId);

  return (
    <div className="container mx-auto max-w-2xl space-y-4 p-4">
      <div className="text-sm text-muted-foreground">
        <Link className="text-primary underline" href="/projects">
          プロジェクト
        </Link>{" "}
        / 編集
      </div>
      <h1 className="font-bold">プロジェクトを編集</h1>
      <Card className="p-6">
        <Suspense fallback={<ProjectEditFormSkeleton />}>
          <ProjectEditFormContainer projectIdPromise={projectIdPromise} />
        </Suspense>
      </Card>
    </div>
  );
}
