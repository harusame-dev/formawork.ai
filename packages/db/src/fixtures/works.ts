import type { InsertWork } from "../schema/work";
import { WorkStatus } from "../schema/work";
import { PROJECT_CATALOG_ID } from "./projects";

export const WORK_OVERVIEW_ID = "22222222-2222-2222-2222-222222222201";
const WORK_PRICE_ID = "22222222-2222-2222-2222-222222222202";

export const worksFixture: InsertWork[] = [
  {
    id: WORK_OVERVIEW_ID,
    name: "01_製品概要",
    projectId: PROJECT_CATALOG_ID,
    sourceFileName: "01_製品概要.docx",
    status: WorkStatus.InProgress,
  },
  {
    id: WORK_PRICE_ID,
    name: "04_価格表",
    projectId: PROJECT_CATALOG_ID,
    sourceFileName: "04_価格表.docx",
    status: WorkStatus.NotStarted,
  },
];
