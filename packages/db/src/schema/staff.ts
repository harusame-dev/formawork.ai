import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 検索用インデックスを設けない理由:
// スタッフ数は数百件程度の想定のため、シーケンシャルスキャンで十分高速
export const staffsTable = pgSchema(schemaName)
	.table("staffs", {
		// auth.users への外部キー制約を設けない理由:
		// スタッフ登録時に先にスタッフレコードを作成し、その後 auth user を作成するため
		// 外部キー制約があると、存在しない auth user への参照でエラーになる
		authUserId: uuid("auth_user_id").unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		staffId: uuid("staff_id").primaryKey().defaultRandom(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	})
	.enableRLS();

export type SelectStaff = typeof staffsTable.$inferSelect;
export type InsertStaff = typeof staffsTable.$inferInsert;
