import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { EditorContainer } from "@/features/segment/editor.server";

export default function Page({
  params,
}: PageProps<"/projects/[projectId]/works/[workId]">): React.JSX.Element {
  const projectIdPromise = params.then(({ projectId }) => projectId);
  const workIdPromise = params.then(({ workId }) => workId);

  return (
    <div className="h-full">
      <Suspense
        fallback={
          <div className="space-y-3 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <EditorContainer
          projectIdPromise={projectIdPromise}
          workIdPromise={workIdPromise}
        />
      </Suspense>
    </div>
  );
}
