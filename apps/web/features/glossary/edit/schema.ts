import * as v from "valibot";
import {
  noteSchema,
  sourceTermSchema,
  targetTermSchema,
} from "@/features/glossary/schema";

export const editGlossaryFormSchema = v.object({
  note: noteSchema,
  sourceTerm: sourceTermSchema,
  targetTerm: targetTermSchema,
});

export type EditGlossaryFormValues = v.InferOutput<typeof editGlossaryFormSchema>;

export const editGlossarySchema = v.object({
  glossaryId: v.pipe(v.string(), v.uuid()),
  note: noteSchema,
  sourceTerm: sourceTermSchema,
  targetTerm: targetTermSchema,
});

export type EditGlossaryParams = v.InferOutput<typeof editGlossarySchema>;
