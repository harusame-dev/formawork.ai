import {
	index,
	pgSchema,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { eventsTable } from "./events";

export const eventAttendanceUrlsTable = pgSchema(schemaName)
	.table(
		"event_attendance_urls",
		{
			createdAt: timestamp("created_at", { withTimezone: true })
				.defaultNow()
				.notNull(),
			eventAttendanceUrlId: uuid("event_attendance_url_id")
				.primaryKey()
				.defaultRandom(),
			eventId: uuid("event_id")
				.notNull()
				.unique()
				.references(() => eventsTable.eventId, { onDelete: "cascade" }),
			token: text("token").notNull(),
		},
		(t) => [
			index("idx_event_attendance_urls_token").on(t.token),
			unique("uq_event_attendance_urls_token").on(t.token),
		],
	)
	.enableRLS();

export type SelectEventAttendanceUrl =
	typeof eventAttendanceUrlsTable.$inferSelect;
export type InsertEventAttendanceUrl =
	typeof eventAttendanceUrlsTable.$inferInsert;
