import * as v from "valibot";
import {
  projectDescriptionSchema,
  projectNameSchema,
  projectVisibilitySchema,
} from "@/features/project/schema";

export const registerProjectSchema = v.object({
  description: projectDescriptionSchema,
  name: projectNameSchema,
  visibility: projectVisibilitySchema,
});

export type RegisterProjectParams = v.InferOutput<typeof registerProjectSchema>;
