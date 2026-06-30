import * as v from "valibot";

const uuidSchema = v.pipe(v.string(), v.uuid());

export const updateSegmentSchema = v.object({
  projectId: uuidSchema,
  segmentId: uuidSchema,
  targetText: v.pipe(v.string(), v.maxLength(5000)),
  workId: uuidSchema,
});

export const confirmSegmentSchema = v.object({
  projectId: uuidSchema,
  segmentId: uuidSchema,
  workId: uuidSchema,
});

export const mergeSegmentsSchema = v.object({
  projectId: uuidSchema,
  segmentIds: v.pipe(v.array(uuidSchema), v.minLength(2)),
  workId: uuidSchema,
});

export const splitSegmentSchema = v.object({
  projectId: uuidSchema,
  segmentId: uuidSchema,
  splitIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
  workId: uuidSchema,
});
