import { index, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { customerNotesTable } from "./customer-note";

export const customerNoteAdviceTable = pgSchema(schemaName).table(
	"customer_note_advice",
	{
		advice: text("advice").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		customerNoteId: uuid("customer_note_id")
			.notNull()
			.references(() => customerNotesTable.id, { onDelete: "cascade" }),
		id: uuid("id").primaryKey().defaultRandom(),
	},
	(table) => ({
		// customerNoteId + createdAt DESC の複合インデックス
		// customerNoteId だけの検索もこのインデックスでカバーされる
		customerNoteCreatedIdx: index("idx_customer_note_advice_created").on(
			table.customerNoteId,
			table.createdAt.desc(),
		),
	}),
);

export type SelectCustomerNoteAdvice =
	typeof customerNoteAdviceTable.$inferSelect;
export type InsertCustomerNoteAdvice =
	typeof customerNoteAdviceTable.$inferInsert;
