import {
	date,
	index,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";

export const eventsTable = pgSchema(schemaName)
	.table(
		"events",
		{
			createdAt: timestamp("created_at", { withTimezone: true })
				.defaultNow()
				.notNull(),
			description: text("description"),
			eventDates: date("event_dates").array().notNull(),
			eventId: uuid("event_id").primaryKey().defaultRandom(),
			name: text("name").notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true })
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
		},
		(t) => [index("idx_events_name").on(t.name)],
	)
	.enableRLS();

export type SelectEvent = typeof eventsTable.$inferSelect;
export type InsertEvent = typeof eventsTable.$inferInsert;
