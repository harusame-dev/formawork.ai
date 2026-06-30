"use server";

import { updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "@/features/project/tag";
import { deleteProject } from "./delete-project";

const deleteProjectSchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
});

export const deleteProjectAction = createServerAction(
  async (input, { userId }) => deleteProject({ ...input, userId }),
  {
    name: "deleteProjectAction",
    onSuccess: ({ input: { projectId } }) => {
      updateTag(ProjectTag.List);
      updateTag(ProjectTag.Detail(projectId));

      redirect("/projects", RedirectType.replace);
    },
    schema: deleteProjectSchema,
  },
);
