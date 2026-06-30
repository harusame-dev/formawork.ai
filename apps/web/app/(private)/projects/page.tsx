import type React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectsContainer } from "@/features/project/list/projects.server";
import { ProjectsSkeleton } from "@/features/project/list/projects-skeleton.universal";

export default function Page(): React.JSX.Element {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-bold">プロジェクト</h1>
          <p className="text-sm text-muted-foreground">
            和文 → 英訳の翻訳プロジェクトを管理します
          </p>
        </div>
        <Link
          className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          href="/projects/new"
        >
          <Plus className="size-4" />
          新規プロジェクト
        </Link>
      </div>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContainer />
      </Suspense>
    </div>
  );
}
