"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "@/features/project/tag";
import { registerProject } from "./register-project";
import { registerProjectSchema } from "./schema";

export const registerProjectAction = createServerAction(
  async (input, { userId }) =>
    registerProject({ ...input, ownerUserId: userId }),
  {
    name: "registerProjectAction",
    onSuccess: ({ result: { projectId } }) => {
      updateTag(ProjectTag.List);

      redirect(`/projects/${projectId}`);
    },
    schema: registerProjectSchema,
  },
);
