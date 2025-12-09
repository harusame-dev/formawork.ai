import { index, jsonb, pgSchema, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { customerNotesTable } from "./customer-note";

/**
 * 今回の接客評価
 */
export type CurrentEvaluation = {
	/** 良かった点 */
	good: string;
	/** 改善ポイント */
	improvement: string;
};

/**
 * 次回の接客アドバイス
 */
export type NextAdvice = {
	/** 注意点・避けるべきこと */
	caution: string;
	/** 確認・フォローすべきこと */
	followUpItems: string;
	/** 次回に向けて確認しておくこと */
	nextActions: string;
	/** 冒頭で触れるべきこと */
	openingTopics: string;
	/** 提案の機会 */
	salesOpportunities: string;
};

/**
 * 接客アドバイスJSON構造
 */
export type AdviceContent = {
	currentEvaluation: CurrentEvaluation;
	nextAdvice: NextAdvice;
};

export const customerNoteAdviceTable = pgSchema(schemaName).table(
	"customer_note_advice",
	{
		advice: jsonb("advice").$type<AdviceContent>().notNull(),
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
