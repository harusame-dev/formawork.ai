"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "@/features/project/tag";
import { removeMember } from "./remove-member";
import { removeMemberSchema } from "./schema";

export const removeMemberAction = createServerAction(
  async (input, { userId }) =>
    removeMember({ ...input, operatorUserId: userId }),
  {
    name: "removeMemberAction",
    onSuccess: ({ input: { projectId } }) => {
      updateTag(ProjectTag.MembersByProjectId(projectId));
      updateTag(ProjectTag.List);
    },
    schema: removeMemberSchema,
  },
);
