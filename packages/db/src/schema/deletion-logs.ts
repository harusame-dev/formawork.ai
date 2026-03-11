import {
	index,
	jsonb,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// deletedBy に FK を設けない理由:
// staffs 削除時に削除ログが消えるのを防ぐため
export const deletionLogsTable = pgSchema(schemaName)
	.table(
		"deletion_logs",
		{
			deletedAt: timestamp("deleted_at").defaultNow().notNull(),
			deletedBy: uuid("deleted_by"),
			deletedData: jsonb("deleted_data").notNull(),
			id: uuid("id").primaryKey().defaultRandom(),
			recordId: uuid("record_id").notNull(),
			tableNameText: text("table_name_text").notNull(),
		},
		(t) => [
			index("idx_deletion_logs_table_deleted_at").on(
				t.tableNameText,
				t.deletedAt.desc(),
			),
			index("idx_deletion_logs_deleted_by").on(t.deletedBy),
		],
	)
	.enableRLS();

export type SelectDeletionLog = typeof deletionLogsTable.$inferSelect;
export type InsertDeletionLog = typeof deletionLogsTable.$inferInsert;
