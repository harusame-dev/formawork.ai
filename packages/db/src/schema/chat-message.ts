import {
	bigserial,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

export const chatMessagesTable = pgSchema(schemaName)
	.table("chat_messages", {
		chatId: uuid("chat_id").notNull(),
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		messageId: bigserial("message_id", { mode: "number" }).primaryKey(),
		role: text("role").notNull(), // 'user' | 'assistant' | 'system'
	})
	.enableRLS();

export type SelectChatMessage = typeof chatMessagesTable.$inferSelect;
export type InsertChatMessage = typeof chatMessagesTable.$inferInsert;
