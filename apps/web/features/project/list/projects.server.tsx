import type React from "react";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getProjects } from "./get-projects";
import { ProjectsPresenter } from "./projects.universal";

export async function ProjectsContainer(): Promise<React.JSX.Element> {
  const userId = await getUserStaffId();
  const projects = userId ? await getProjects(userId) : [];

  return <ProjectsPresenter projects={projects} />;
}
