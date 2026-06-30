import type React from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { GlossaryTableSkeleton } from "@/features/glossary/glossary-table-skeleton.universal";
import { ProjectGlossaryContainer } from "@/features/glossary/project/project-glossary.server";

export default function Page({
  params,
}: PageProps<"/projects/[projectId]/glossary">): React.JSX.Element {
  const projectIdPromise = params.then(({ projectId }) => projectId);

  return (
    <div className="container mx-auto max-w-5xl space-y-4 p-4">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-7 w-32" />
            <Card className="p-4">
              <GlossaryTableSkeleton />
            </Card>
          </div>
        }
      >
        <ProjectGlossaryContainer projectIdPromise={projectIdPromise} />
      </Suspense>
    </div>
  );
}
