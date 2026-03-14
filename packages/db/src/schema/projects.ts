import {
	date,
	index,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

export const projectsTable = pgSchema(schemaName)
	.table(
		"projects",
		{
			archivedAt: timestamp("archived_at"),
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
			index("idx_projects_due_date").on(t.dueDate),
			index("idx_projects_name").on(t.name),
		],
	)
	.enableRLS();

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
