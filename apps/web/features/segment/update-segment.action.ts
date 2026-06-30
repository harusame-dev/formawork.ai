"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { WorkTag } from "@/features/work/tag";
import { updateSegmentSchema } from "./schema";
import { updateSegment } from "./update-segment";

export const updateSegmentAction = createServerAction(
  async (input, { userId }) =>
    updateSegment({
      segmentId: input.segmentId,
      targetText: input.targetText,
      userId,
    }),
  {
    name: "updateSegmentAction",
    onSuccess: ({ input: { projectId, workId } }) => {
      updateTag(WorkTag.SegmentsByWorkId(workId));
      updateTag(WorkTag.ListByProjectId(projectId));
    },
    schema: updateSegmentSchema,
  },
);
