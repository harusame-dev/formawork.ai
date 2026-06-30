import { ProjectMemberRole } from "@workspace/db/schema/project";
import * as v from "valibot";

export const addMemberSchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
  role: v.picklist(
    [ProjectMemberRole.Editor, ProjectMemberRole.Viewer],
    "ロールを選択してください",
  ),
  userId: v.pipe(v.string(), v.uuid()),
});

export type AddMemberParams = v.InferOutput<typeof addMemberSchema>;

export const removeMemberSchema = v.object({
  projectId: v.pipe(v.string(), v.uuid()),
  userId: v.pipe(v.string(), v.uuid()),
});

export type RemoveMemberParams = v.InferOutput<typeof removeMemberSchema>;
