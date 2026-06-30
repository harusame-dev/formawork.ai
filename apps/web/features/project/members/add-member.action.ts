"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { ProjectTag } from "@/features/project/tag";
import { addMember } from "./add-member";
import { addMemberSchema } from "./schema";

export const addMemberAction = createServerAction(
  async (input, { userId }) => addMember({ ...input, operatorUserId: userId }),
  {
    name: "addMemberAction",
    onSuccess: ({ input: { projectId } }) => {
      updateTag(ProjectTag.MembersByProjectId(projectId));
      updateTag(ProjectTag.List);
    },
    schema: addMemberSchema,
  },
);
