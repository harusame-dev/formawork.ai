import {
  customType,
  index,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { projectsTable } from "./project";

/**
 * pgvector の vector 型カラム。
 *
 * 拡張は `extensions` スキーマに導入する（Supabase 標準）。マイグレーション時の
 * search_path は対象スキーマのみに設定されるため、型名・演算子クラスは
 * `extensions.` で明示修飾し、search_path に依存せず解決できるようにする。
 */
export const embedding = customType<{
  config: { dimensions: number };
  data: number[];
  driverData: string;
}>({
  dataType(config) {
    return `extensions.vector(${config?.dimensions ?? 1536})`;
  },
  fromDriver(value) {
    return JSON.parse(value) as number[];
  },
  toDriver(value) {
    return JSON.stringify(value);
  },
});

/**
 * 翻訳メモリ（確定済み対訳の蓄積）。
 * source_embedding は原文（和文）の埋め込みで、類似検索の母集団になる。
 */
export const translationMemoriesTable = pgSchema(schemaName)
  .table(
    "translation_memories",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      id: uuid("id").primaryKey().defaultRandom(),
      projectId: uuid("project_id")
        .notNull()
        .references(() => projectsTable.id, { onDelete: "cascade" }),
      sourceEmbedding: embedding("source_embedding", {
        dimensions: 1536,
      }).notNull(),
      sourceText: text("source_text").notNull(),
      targetText: text("target_text").notNull(),
    },
    (table) => [index("idx_tm_project").on(table.projectId)],
  )
  .enableRLS();

export type SelectTranslationMemory =
  typeof translationMemoriesTable.$inferSelect;
export type InsertTranslationMemory =
  typeof translationMemoriesTable.$inferInsert;
