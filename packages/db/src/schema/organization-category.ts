import {
	boolean,
	pgSchema,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 組織カテゴリーマスタ（11 + システム管理 1 件）
export const organizationCategoriesTable = pgSchema(schemaName)
	.table("organization_categories", {
		categoryId: uuid("category_id").primaryKey().defaultRandom(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		isSystem: boolean("is_system").notNull().default(false),
		name: text("name").notNull(),
		sortOrder: smallint("sort_order").notNull(),
	})
	.enableRLS();

export type SelectOrganizationCategory =
	typeof organizationCategoriesTable.$inferSelect;
export type InsertOrganizationCategory =
	typeof organizationCategoriesTable.$inferInsert;
