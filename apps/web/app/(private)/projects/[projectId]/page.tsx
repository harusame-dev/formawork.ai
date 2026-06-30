import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { ProjectDetailContainer } from "@/features/project/detail/project-detail.server";

export default function Page({
  params,
}: PageProps<"/projects/[projectId]">): React.JSX.Element {
  const projectIdPromise = params.then(({ projectId }) => projectId);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-5xl space-y-6 p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <ProjectDetailContainer projectIdPromise={projectIdPromise} />
    </Suspense>
  );
}
