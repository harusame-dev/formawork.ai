import type React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { MembersCardSkeleton } from "@/features/project/members/members-card-skeleton.universal";
import { ProjectMembersContainer } from "@/features/project/members/project-members.server";

export default function Page({
  params,
}: PageProps<"/projects/[projectId]/members">): React.JSX.Element {
  const projectIdPromise = params.then(({ projectId }) => projectId);

  return (
    <div className="container mx-auto max-w-5xl space-y-4 p-4">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <MembersCardSkeleton />
          </div>
        }
      >
        <ProjectMembersContainer projectIdPromise={projectIdPromise} />
      </Suspense>
    </div>
  );
}
