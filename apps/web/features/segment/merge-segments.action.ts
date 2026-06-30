"use server";

import { updateTag } from "next/cache";
import { createServerAction } from "@/libs/create-server-action";
import { WorkTag } from "@/features/work/tag";
import { mergeSegments } from "./merge-segments";
import { mergeSegmentsSchema } from "./schema";

export const mergeSegmentsAction = createServerAction(
  async (input, { userId }) =>
    mergeSegments({ segmentIds: input.segmentIds, userId }),
  {
    name: "mergeSegmentsAction",
    onSuccess: ({ input: { projectId, workId } }) => {
      updateTag(WorkTag.SegmentsByWorkId(workId));
      updateTag(WorkTag.ListByProjectId(projectId));
    },
    schema: mergeSegmentsSchema,
  },
);
