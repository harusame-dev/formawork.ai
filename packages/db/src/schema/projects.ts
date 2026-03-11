import {
	date,
	index,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { staffsTable } from "./staff";

export const projectsTable = pgSchema(schemaName)
	.table(
		"projects",
		{
			assigneeId: uuid("assignee_id").references(() => staffsTable.staffId),
			createdAt: timestamp("created_at").defaultNow().notNull(),
			description: text("description"),
			dueDate: date("due_date"),
			name: text("name").notNull(),
			projectId: uuid("project_id").primaryKey().defaultRandom(),
			updatedAt: timestamp("updated_at")
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
		},
		(t) => [
			index("idx_projects_assignee_id").on(t.assigneeId),
			index("idx_projects_due_date").on(t.dueDate),
			index("idx_projects_name").on(t.name),
		],
	)
	.enableRLS();

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
