import {
	boolean,
	index,
	pgSchema,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { customersTable } from "./customer";

/**
 * メモリーカテゴリ定義
 */
export const MemoryCategory = {
	Communication: 4,
	Conversion: 3,
	Event: 5,
	Health: 6,
	Personal: 1,
	Preference: 2,
} as const;

export type MemoryCategory =
	(typeof MemoryCategory)[keyof typeof MemoryCategory];

export const MEMORY_CATEGORY_LABEL: Record<MemoryCategory, string> = {
	[MemoryCategory.Personal]: "パーソナル情報",
	[MemoryCategory.Preference]: "趣味趣向",
	[MemoryCategory.Conversion]: "コンバージョン傾向",
	[MemoryCategory.Communication]: "コミュニケーション特性",
	[MemoryCategory.Event]: "重要イベント",
	[MemoryCategory.Health]: "健康・身体的配慮",
};

export const customerMemoriesTable = pgSchema(schemaName)
	.table(
		"customer_memories",
		{
			category: smallint("category").notNull(),
			content: text("content").notNull(),
			createdAt: timestamp("created_at").defaultNow().notNull(),
			customerId: uuid("customer_id")
				.notNull()
				.references(() => customersTable.customerId, { onDelete: "cascade" }),
			id: uuid("id").primaryKey().defaultRandom(),
			importance: smallint("importance").notNull().default(5),
			isProtected: boolean("is_protected").notNull().default(false),
			sourceNoteId: uuid("source_note_id"),
			updatedAt: timestamp("updated_at")
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
		},
		(table) => ({
			customerCategoryIdx: index("idx_customer_memories_category").on(
				table.customerId,
				table.category,
			),
			customerImportanceIdx: index("idx_customer_memories_importance").on(
				table.customerId,
				table.importance.desc(),
			),
		}),
	)
	.enableRLS();

export type SelectCustomerMemory = typeof customerMemoriesTable.$inferSelect;
export type InsertCustomerMemory = typeof customerMemoriesTable.$inferInsert;
