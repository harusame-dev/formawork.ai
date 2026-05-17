import { pgSchema, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 組織ユーザー（admin 含む）
// admin / org_user のロール判定は auth.users.app_metadata.role で行う
// organization_id は通常は必須（admin はシステム管理組織に所属）。
// 組織削除時に NULL にセットされ、対応する auth ユーザーは ban される
export const usersTable = pgSchema(schemaName)
	.table("users", {
		authUserId: uuid("auth_user_id").unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		organizationId: uuid("organization_id"),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
		userId: uuid("user_id").primaryKey().defaultRandom(),
	})
	.enableRLS();

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
