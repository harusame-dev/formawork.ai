import * as v from "valibot";

export const deleteGlossarySchema = v.object({
  glossaryId: v.pipe(v.string(), v.uuid()),
});
