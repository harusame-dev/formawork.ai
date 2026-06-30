import type React from "react";
import { Suspense } from "react";
import { ProjectGlossarySkeleton } from "@/features/glossary/project/project-glossary-skeleton.universal";
import { ProjectGlossaryContainer } from "@/features/glossary/project/project-glossary.server";

export default function Page({
  params,
}: PageProps<"/projects/[projectId]/glossary">): React.JSX.Element {
  const projectIdPromise = params.then(({ projectId }) => projectId);

  return (
    <div className="container mx-auto max-w-5xl space-y-4 p-4">
      <Suspense fallback={<ProjectGlossarySkeleton />}>
        <ProjectGlossaryContainer projectIdPromise={projectIdPromise} />
      </Suspense>
    </div>
  );
}
