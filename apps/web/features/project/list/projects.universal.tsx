import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { ProjectVisibilityBadge } from "@/features/project/project-visibility-badge.universal";
import type { ProjectListItem } from "./get-projects";

export function ProjectsPresenter({
  projects,
}: {
  projects: ProjectListItem[];
}): React.JSX.Element {
  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        プロジェクトがありません。「新規プロジェクト」から作成してください。
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          className="block transition-colors"
          href={`/projects/${project.id}`}
          key={project.id}
        >
          <Card className="h-full hover:border-ring">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <ProjectVisibilityBadge visibility={project.visibility} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                {project.description || "—"}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
