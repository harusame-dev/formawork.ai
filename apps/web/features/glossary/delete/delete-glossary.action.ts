"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { GlossaryTag } from "@/features/glossary/tag";
import { deleteGlossary } from "./delete-glossary";
import { deleteGlossarySchema } from "./schema";

export const deleteGlossaryAction = createServerAction(
  async (input, { userId }) => deleteGlossary({ ...input, userId }),
  {
    name: "deleteGlossaryAction",
    onSuccess: ({ result }) => {
      if (result.projectId == null) {
        updateTag(GlossaryTag.Common);
      } else {
        updateTag(GlossaryTag.ByProjectId(result.projectId));
      }
    },
    schema: deleteGlossarySchema,
  },
);
