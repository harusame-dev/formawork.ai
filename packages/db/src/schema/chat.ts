import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 相談チャット
// 公開 UUID で識別。referrer_org_id は発行元組織（業者紹介の追跡用）
// 組織削除時は NULL にセット（履歴は残す）
// contact_email は「相談する」ボタンで業者へメール送信した際に取得・永続化
// last_accessed_at は最終アクセスから 1 週間で公開アクセスを遮断するため
export const chatsTable = pgSchema(schemaName)
	.table("chats", {
		chatId: uuid("chat_id").primaryKey().defaultRandom(),
		contactEmail: text("contact_email"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
		referrerOrgId: uuid("referrer_org_id"),
	})
	.enableRLS();

export type SelectChat = typeof chatsTable.$inferSelect;
export type InsertChat = typeof chatsTable.$inferInsert;
