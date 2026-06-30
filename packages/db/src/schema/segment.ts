import {
  index,
  integer,
  pgSchema,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { worksTable } from "./work";

/**
 * セグメント（翻訳の最小単位 / 原則 1 文）の確定状態
 */
export const SegmentStatus = {
  Confirmed: 3,
  Draft: 2,
  Untranslated: 1,
} as const;

export type SegmentStatus = (typeof SegmentStatus)[keyof typeof SegmentStatus];

export const SEGMENT_STATUS_LABEL: Record<SegmentStatus, string> = {
  [SegmentStatus.Untranslated]: "未訳",
  [SegmentStatus.Draft]: "下書き",
  [SegmentStatus.Confirmed]: "確定",
};

export const segmentsTable = pgSchema(schemaName)
  .table(
    "segments",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      id: uuid("id").primaryKey().defaultRandom(),
      // 対訳エディタ上の表示順
      seq: integer("seq").notNull(),
      sourceText: text("source_text").notNull(),
      status: smallint("status").notNull().default(SegmentStatus.Untranslated),
      targetText: text("target_text"),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
      workId: uuid("work_id")
        .notNull()
        .references(() => worksTable.id, { onDelete: "cascade" }),
    },
    (table) => [index("idx_segments_work_seq").on(table.workId, table.seq)],
  )
  .enableRLS();

export type SelectSegment = typeof segmentsTable.$inferSelect;
export type InsertSegment = typeof segmentsTable.$inferInsert;
