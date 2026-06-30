"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { GlossaryTag } from "@/features/glossary/tag";
import { editGlossary } from "./edit-glossary";
import { editGlossarySchema } from "./schema";

export const editGlossaryAction = createServerAction(
  async (input, { userId }) => editGlossary({ ...input, userId }),
  {
    name: "editGlossaryAction",
    onSuccess: ({ result }) => {
      if (result.projectId == null) {
        updateTag(GlossaryTag.Common);
      } else {
        updateTag(GlossaryTag.ByProjectId(result.projectId));
      }
    },
    schema: editGlossarySchema,
  },
);
