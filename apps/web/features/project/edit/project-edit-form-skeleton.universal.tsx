import type React from "react";
import { ProjectForm } from "@/features/project/create/project-form.client";

export function ProjectEditFormSkeleton(): React.JSX.Element {
  return <ProjectForm disabled />;
}
