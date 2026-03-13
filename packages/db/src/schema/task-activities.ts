import {
	index,
	jsonb,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { staffsTable } from "./staff";
import { tasksTable } from "./tasks";

export const taskActivitiesTable = pgSchema(schemaName)
	.table(
		"task_activities",
		{
			activityId: uuid("activity_id").primaryKey().defaultRandom(),
			authorId: uuid("author_id")
				.notNull()
				.references(() => staffsTable.staffId),
			content: text("content"),
			createdAt: timestamp("created_at").defaultNow().notNull(),
			metadata: jsonb("metadata"),
			taskId: uuid("task_id")
				.notNull()
				.references(() => tasksTable.taskId, { onDelete: "cascade" }),
			type: text("type").notNull(),
			updatedAt: timestamp("updated_at")
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
		},
		(t) => [
			index("idx_task_activities_task_created").on(t.taskId, t.createdAt.asc()),
		],
	)
	.enableRLS();

export type SelectTaskActivity = typeof taskActivitiesTable.$inferSelect;
export type InsertTaskActivity = typeof taskActivitiesTable.$inferInsert;
