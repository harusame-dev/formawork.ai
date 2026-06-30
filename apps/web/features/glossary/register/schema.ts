import * as v from "valibot";
import {
  noteSchema,
  sourceTermSchema,
  targetTermSchema,
} from "@/features/glossary/schema";

export const registerGlossarySchema = v.object({
  note: noteSchema,
  projectId: v.optional(v.nullable(v.pipe(v.string(), v.uuid()))),
  sourceTerm: sourceTermSchema,
  targetTerm: targetTermSchema,
});

export type RegisterGlossaryParams = v.InferOutput<
  typeof registerGlossarySchema
>;
