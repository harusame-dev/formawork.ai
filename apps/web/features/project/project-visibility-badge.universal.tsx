import type React from "react";
import {
  PROJECT_VISIBILITY_LABEL,
  type ProjectVisibility,
  ProjectVisibility as Visibility,
} from "@workspace/db/schema/project";
import { Badge } from "@workspace/ui/components/badge";
import { Globe, Lock } from "lucide-react";

export function ProjectVisibilityBadge({
  visibility,
}: {
  visibility: ProjectVisibility;
}): React.JSX.Element {
  const isPublic = visibility === Visibility.Public;

  return (
    <Badge className="gap-1" variant={isPublic ? "default" : "secondary"}>
      {isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
      {PROJECT_VISIBILITY_LABEL[visibility]}
    </Badge>
  );
}
