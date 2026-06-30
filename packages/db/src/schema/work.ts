import {
  index,
  pgSchema,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { projectsTable } from "./project";

/**
 * ワーク（= 1 ドキュメント）の翻訳ステータス
 */
export const WorkStatus = {
  Completed: 3,
  InProgress: 2,
  NotStarted: 1,
} as const;

export type WorkStatus = (typeof WorkStatus)[keyof typeof WorkStatus];

export const WORK_STATUS_LABEL: Record<WorkStatus, string> = {
  [WorkStatus.NotStarted]: "未着手",
  [WorkStatus.InProgress]: "翻訳中",
  [WorkStatus.Completed]: "完了",
};

export const worksTable = pgSchema(schemaName)
  .table(
    "works",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      id: uuid("id").primaryKey().defaultRandom(),
      name: text("name").notNull(),
      projectId: uuid("project_id")
        .notNull()
        .references(() => projectsTable.id, { onDelete: "cascade" }),
      sourceFileName: text("source_file_name").notNull().default(""),
      status: smallint("status").notNull().default(WorkStatus.NotStarted),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    },
    (table) => [
      index("idx_works_project").on(table.projectId, table.createdAt.desc()),
    ],
  )
  .enableRLS();

export type SelectWork = typeof worksTable.$inferSelect;
export type InsertWork = typeof worksTable.$inferInsert;
