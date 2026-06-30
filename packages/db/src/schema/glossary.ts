import { index, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { projectsTable } from "./project";

/**
 * 用語集。
 * project_id が NULL のエントリは全プロジェクト共通の用語集を表す。
 */
export const glossariesTable = pgSchema(schemaName)
  .table(
    "glossaries",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      id: uuid("id").primaryKey().defaultRandom(),
      note: text("note").notNull().default(""),
      // NULL = 共通用語集
      projectId: uuid("project_id").references(() => projectsTable.id, {
        onDelete: "cascade",
      }),
      sourceTerm: text("source_term").notNull(),
      targetTerm: text("target_term").notNull(),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    },
    (table) => [index("idx_glossaries_project").on(table.projectId)],
  )
  .enableRLS();

export type SelectGlossary = typeof glossariesTable.$inferSelect;
export type InsertGlossary = typeof glossariesTable.$inferInsert;
