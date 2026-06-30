import type React from "react";
import { Button } from "@workspace/ui/components/button";
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
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="size-4" />
            新規プロジェクト
          </Link>
        </Button>
      </div>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContainer />
      </Suspense>
    </div>
  );
}
