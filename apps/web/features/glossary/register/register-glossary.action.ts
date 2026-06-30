"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { GlossaryTag } from "@/features/glossary/tag";
import { registerGlossary } from "./register-glossary";
import { registerGlossarySchema } from "./schema";

export const registerGlossaryAction = createServerAction(
  async (input, { userId }) => registerGlossary({ ...input, userId }),
  {
    name: "registerGlossaryAction",
    onSuccess: ({ input: { projectId } }) => {
      if (projectId == null) {
        updateTag(GlossaryTag.Common);
      } else {
        updateTag(GlossaryTag.ByProjectId(projectId));
      }
    },
    schema: registerGlossarySchema,
  },
);
