"use server";

import { updateTag } from "next/cache";
import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";
import { WorkTag } from "@/features/work/tag";
import { importWork } from "./import-work";

const importWorkSchema = v.object({
  file: v.instance(File, "ファイルを選択してください"),
  projectId: v.pipe(v.string(), v.uuid()),
});

export const importWorkAction = createServerAction(
  async (input, { userId }) => {
    const fileBuffer = Buffer.from(await input.file.arrayBuffer());

    return importWork({
      fileBuffer,
      fileName: input.file.name,
      projectId: input.projectId,
      userId,
    });
  },
  {
    name: "importWorkAction",
    onSuccess: ({ input: { projectId } }) => {
      updateTag(WorkTag.ListByProjectId(projectId));
    },
    schema: importWorkSchema,
  },
);
