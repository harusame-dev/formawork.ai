import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// 相談記録（チャットから組織へメール送信した履歴）
// chat_id は NOT NULL（チャットなしの相談は存在しない）
// target_org_id は組織削除時に NULL にセット（履歴は残す）
export const consultationsTable = pgSchema(schemaName)
	.table("consultations", {
		chatId: uuid("chat_id").notNull(),
		consultationId: uuid("consultation_id").primaryKey().defaultRandom(),
		contactEmail: text("contact_email").notNull(),
		sentAt: timestamp("sent_at").defaultNow().notNull(),
		targetOrgId: uuid("target_org_id"),
		todoId: uuid("todo_id"),
	})
	.enableRLS();

export type SelectConsultation = typeof consultationsTable.$inferSelect;
export type InsertConsultation = typeof consultationsTable.$inferInsert;
