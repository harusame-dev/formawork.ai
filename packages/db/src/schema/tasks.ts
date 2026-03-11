import {
	date,
	index,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { projectsTable } from "./projects";
import { staffsTable } from "./staff";

export const tasksTable = pgSchema(schemaName)
	.table(
		"tasks",
		{
			assigneeId: uuid("assignee_id").references(() => staffsTable.staffId),
			createdAt: timestamp("created_at").defaultNow().notNull(),
			description: text("description"),
			dueDate: date("due_date"),
			name: text("name").notNull(),
			projectId: uuid("project_id")
				.notNull()
				.references(() => projectsTable.projectId, { onDelete: "cascade" }),
			status: text("status").notNull(),
			taskId: uuid("task_id").primaryKey().defaultRandom(),
			updatedAt: timestamp("updated_at")
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
		},
		(t) => [
			index("idx_tasks_project_created").on(t.projectId, t.createdAt.desc()),
			index("idx_tasks_assignee_id").on(t.assigneeId),
			index("idx_tasks_status").on(t.status),
		],
	)
	.enableRLS();

export type SelectTask = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;
