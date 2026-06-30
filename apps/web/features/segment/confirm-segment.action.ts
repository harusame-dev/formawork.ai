"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { TranslationMemoryTag } from "@/features/translation-memory/tag";
import { WorkTag } from "@/features/work/tag";
import { confirmSegment } from "./confirm-segment";
import { confirmSegmentSchema } from "./schema";

export const confirmSegmentAction = createServerAction(
  async (input, { userId }) =>
    confirmSegment({ segmentId: input.segmentId, userId }),
  {
    name: "confirmSegmentAction",
    onSuccess: ({ input: { projectId, workId } }) => {
      updateTag(WorkTag.SegmentsByWorkId(workId));
      updateTag(WorkTag.ListByProjectId(projectId));
      updateTag(TranslationMemoryTag.All);
      updateTag(TranslationMemoryTag.ByProjectId(projectId));
    },
    schema: confirmSegmentSchema,
  },
);
