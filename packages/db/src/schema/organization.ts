import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 組織
// category_id は organization_categories への参照だが、
// FK 制約はスキーマ間の依存を避けるため設けない（アプリ層で担保）
export const organizationsTable = pgSchema(schemaName)
	.table("organizations", {
		categoryId: uuid("category_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		description: text("description").notNull().default(""),
		email: text("email").notNull().default(""),
		name: text("name").notNull(),
		organizationId: uuid("organization_id").primaryKey().defaultRandom(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
		url: text("url").notNull().default(""),
	})
	.enableRLS();

export type SelectOrganization = typeof organizationsTable.$inferSelect;
export type InsertOrganization = typeof organizationsTable.$inferInsert;
