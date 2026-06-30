"use server";

import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { translateSegment } from "./translate-segment";

const translateSegmentSchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
  segmentId: v.pipe(v.string(), v.uuid()),
});

export const translateSegmentAction = createServerAction(
  async (input, { userId }) =>
    translateSegment({
      projectId: input.projectId,
      segmentId: input.segmentId,
      userId,
    }),
  {
    name: "translateSegmentAction",
    schema: translateSegmentSchema,
  },
);
