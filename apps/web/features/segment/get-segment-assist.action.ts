"use server";

import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { getSegmentAssist } from "./get-segment-assist";

const getSegmentAssistSchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
  segmentId: v.pipe(v.string(), v.uuid()),
});

export const getSegmentAssistAction = createServerAction(
  async (input, { userId }) =>
    getSegmentAssist({
      projectId: input.projectId,
      segmentId: input.segmentId,
      userId,
    }),
  {
    name: "getSegmentAssistAction",
    schema: getSegmentAssistSchema,
  },
);
