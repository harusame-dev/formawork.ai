import { index, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { staffsTable } from "./staff";
import { tasksTable } from "./tasks";

export const taskCommentsTable = pgSchema(schemaName)
	.table(
		"task_comments",
		{
			authorId: uuid("author_id")
				.notNull()
				.references(() => staffsTable.staffId),
			commentId: uuid("comment_id").primaryKey().defaultRandom(),
			content: text("content").notNull(),
			createdAt: timestamp("created_at").defaultNow().notNull(),
			taskId: uuid("task_id")
				.notNull()
				.references(() => tasksTable.taskId, { onDelete: "cascade" }),
			updatedAt: timestamp("updated_at")
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
		},
		(t) => [
			index("idx_task_comments_task_created").on(t.taskId, t.createdAt.asc()),
		],
	)
	.enableRLS();

export type SelectTaskComment = typeof taskCommentsTable.$inferSelect;
export type InsertTaskComment = typeof taskCommentsTable.$inferInsert;
