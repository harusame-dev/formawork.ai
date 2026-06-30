import type React from "react";
import type { ProjectVisibility } from "@workspace/db/schema/project";
import { Button } from "@workspace/ui/components/button";
import { BookOpen, Pencil } from "lucide-react";
import Link from "next/link";
import { DeleteProjectDialog } from "@/features/project/delete/delete-project-dialog.client";
import { ProjectVisibilityBadge } from "@/features/project/project-visibility-badge.universal";

interface ProjectHeaderData {
  description: string;
  id: string;
  name: string;
  ownerUserId: string;
  visibility: ProjectVisibility;
}

export function ProjectHeaderPresenter({
  canEdit,
  canManage,
  project,
}: {
  canEdit: boolean;
  canManage: boolean;
  project: ProjectHeaderData;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{project.name}</h1>
          <ProjectVisibilityBadge visibility={project.visibility} />
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/projects/${project.id}/glossary`}>
            <BookOpen className="size-4" />
            用語集
          </Link>
        </Button>
        {canEdit && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil className="size-4" />
              編集
            </Link>
          </Button>
        )}
        {canManage && (
          <DeleteProjectDialog
            projectId={project.id}
            projectName={project.name}
          />
        )}
      </div>
    </div>
  );
}
