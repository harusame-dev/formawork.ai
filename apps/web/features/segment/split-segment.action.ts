"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { WorkTag } from "@/features/work/tag";
import { splitSegmentSchema } from "./schema";
import { splitSegment } from "./split-segment";

export const splitSegmentAction = createServerAction(
  async (input, { userId }) =>
    splitSegment({
      segmentId: input.segmentId,
      splitIndex: input.splitIndex,
      userId,
    }),
  {
    name: "splitSegmentAction",
    onSuccess: ({ input: { projectId, workId } }) => {
      updateTag(WorkTag.SegmentsByWorkId(workId));
      updateTag(WorkTag.ListByProjectId(projectId));
    },
    schema: splitSegmentSchema,
  },
);
