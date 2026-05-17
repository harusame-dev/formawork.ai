import {
	boolean,
	pgSchema,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

// LLM が抽出した TODO
// priority は 0〜6 のフェーズ番号
// 0: 終活 / 1〜5: 相続手続き各期限 / 6: 相続後の資産活用
// suggested_category_id は提案組織カテゴリ（NULL の場合は「相談する」非表示）
export const chatTodosTable = pgSchema(schemaName)
	.table("chat_todos", {
		chatId: uuid("chat_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		description: text("description").notNull().default(""),
		done: boolean("done").notNull().default(false),
		priority: smallint("priority").notNull(),
		suggestedCategoryId: uuid("suggested_category_id"),
		title: text("title").notNull(),
		todoId: uuid("todo_id").primaryKey().defaultRandom(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	})
	.enableRLS();

export type SelectChatTodo = typeof chatTodosTable.$inferSelect;
export type InsertChatTodo = typeof chatTodosTable.$inferInsert;
