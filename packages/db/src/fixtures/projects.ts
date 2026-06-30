import type { InsertProject } from "../schema/project";
import { ProjectVisibility } from "../schema/project";

const OWNER_STAFF_ID = "00000000-0000-0000-0000-000000000001";

export const PROJECT_CATALOG_ID = "11111111-1111-1111-1111-111111111101";
export const PROJECT_HANDBOOK_ID = "11111111-1111-1111-1111-111111111102";

export const projectsFixture: InsertProject[] = [
  {
    description: "新製品ラインの英語版カタログ。マーケ部門向け。",
    id: PROJECT_CATALOG_ID,
    name: "2026 製品カタログ 英訳",
    ownerUserId: OWNER_STAFF_ID,
    visibility: ProjectVisibility.Private,
  },
  {
    description: "就業規則・行動規範の英訳。全社共有。",
    id: PROJECT_HANDBOOK_ID,
    name: "社内規程 ハンドブック",
    ownerUserId: OWNER_STAFF_ID,
    visibility: ProjectVisibility.Public,
  },
];
