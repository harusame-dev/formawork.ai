import type { InsertGlossary } from "../schema/glossary";
import { PROJECT_CATALOG_ID } from "./projects";

export const glossariesFixture: InsertGlossary[] = [
  // 共通用語集（project_id = null）
  {
    note: "",
    projectId: null,
    sourceTerm: "ソリューション",
    targetTerm: "solution",
  },
  {
    note: "PII とは訳さない",
    projectId: null,
    sourceTerm: "個人情報",
    targetTerm: "personal information",
  },
  {
    note: "",
    projectId: null,
    sourceTerm: "製品ライン",
    targetTerm: "product line",
  },
  // プロジェクト固有用語集
  {
    note: '"we" は文脈次第で可',
    projectId: PROJECT_CATALOG_ID,
    sourceTerm: "弊社",
    targetTerm: "our company",
  },
  {
    note: "複数形で",
    projectId: PROJECT_CATALOG_ID,
    sourceTerm: "仕様",
    targetTerm: "specifications",
  },
  {
    note: "",
    projectId: PROJECT_CATALOG_ID,
    sourceTerm: "カタログ",
    targetTerm: "catalog",
  },
];
