"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "@/features/project/tag";
import { editProject } from "./edit-project";
import { editProjectSchema } from "./schema";

export const editProjectAction = createServerAction(
  async (input, { userId }) => editProject({ ...input, userId }),
  {
    name: "editProjectAction",
    onSuccess: ({ input: { projectId } }) => {
      updateTag(ProjectTag.List);
      updateTag(ProjectTag.Detail(projectId));

      redirect(`/projects/${projectId}`);
    },
    schema: editProjectSchema,
  },
);
