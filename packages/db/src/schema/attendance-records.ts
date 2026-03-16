import { index, pgSchema, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { volunteersTable } from "./volunteers";

export const attendanceRecordsTable = pgSchema(schemaName)
	.table(
		"attendance_records",
		{
			attendanceRecordId: uuid("attendance_record_id")
				.primaryKey()
				.defaultRandom(),
			recordedAt: timestamp("recorded_at", { withTimezone: true })
				.defaultNow()
				.notNull(),
			volunteerId: uuid("volunteer_id")
				.notNull()
				.references(() => volunteersTable.volunteerId, { onDelete: "cascade" }),
		},
		(t) => [
			index("idx_attendance_records_volunteer_id_recorded_at").on(
				t.volunteerId,
				t.recordedAt,
			),
		],
	)
	.enableRLS();

export type SelectAttendanceRecord = typeof attendanceRecordsTable.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecordsTable.$inferInsert;
