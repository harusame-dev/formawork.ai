import {
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
export const MEMORY_CATEGORY = {
	COMMUNICATION: 4,
	CONVERSION: 3,
	EVENT: 5,
	HEALTH: 6,
	PERSONAL: 1,
	PREFERENCE: 2,
} as const;

export type MemoryCategory =
	(typeof MEMORY_CATEGORY)[keyof typeof MEMORY_CATEGORY];

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
	[MEMORY_CATEGORY.PERSONAL]: "パーソナル情報",
	[MEMORY_CATEGORY.PREFERENCE]: "趣味趣向",
	[MEMORY_CATEGORY.CONVERSION]: "コンバージョン傾向",
	[MEMORY_CATEGORY.COMMUNICATION]: "コミュニケーション特性",
	[MEMORY_CATEGORY.EVENT]: "重要イベント",
	[MEMORY_CATEGORY.HEALTH]: "健康・身体的配慮",
};

export const customerMemoriesTable = pgSchema(schemaName).table(
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
);

export type SelectCustomerMemory = typeof customerMemoriesTable.$inferSelect;
export type InsertCustomerMemory = typeof customerMemoriesTable.$inferInsert;
