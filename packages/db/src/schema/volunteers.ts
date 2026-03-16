import {
	char,
	date,
	index,
	pgSchema,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { eventsTable } from "./events";

export const volunteersTable = pgSchema(schemaName)
	.table(
		"volunteers",
		{
			code: char("code", { length: 6 }).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true })
				.defaultNow()
				.notNull(),
			eventId: uuid("event_id")
				.notNull()
				.references(() => eventsTable.eventId, { onDelete: "cascade" }),
			gender: text("gender"),
			name: text("name").notNull(),
			participationDates: date("participation_dates").array().notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true })
				.defaultNow()
				.notNull()
				.$onUpdate(() => new Date()),
			volunteerId: uuid("volunteer_id").primaryKey().defaultRandom(),
		},
		(t) => [
			index("idx_volunteers_event_id").on(t.eventId),
			unique("uq_volunteers_event_id_code").on(t.eventId, t.code),
		],
	)
	.enableRLS();

export type SelectVolunteer = typeof volunteersTable.$inferSelect;
export type InsertVolunteer = typeof volunteersTable.$inferInsert;
