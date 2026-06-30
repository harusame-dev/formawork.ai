import * as v from "valibot";
import {
  projectDescriptionSchema,
  projectNameSchema,
  projectVisibilitySchema,
} from "@/features/project/schema";

export const editProjectSchema = v.object({
  description: projectDescriptionSchema,
  name: projectNameSchema,
  projectId: v.pipe(v.string(), v.uuid()),
  visibility: projectVisibilitySchema,
});

export type EditProjectParams = v.InferOutput<typeof editProjectSchema>;
