import { db } from "@workspace/db/client";
import { attendanceRecordsTable } from "@workspace/db/schema/attendance-records";
import { eventsTable } from "@workspace/db/schema/events";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { AttendanceTag } from "../tag";

export type VolunteerAttendanceStatus = {
	volunteerId: string;
	volunteerName: string;
	volunteerCode: string;
	attendanceByDate: Record<string, boolean>;
	participationDates: string[];
};

export type AttendanceStatus = {
	eventDates: string[];
	volunteers: VolunteerAttendanceStatus[];
};

export async function getAttendanceStatus(
	eventId: string,
): Promise<AttendanceStatus | null> {
	"use cache: private";
	cacheTag(AttendanceTag.Status(eventId));

	const eventRows = await db
		.select({ eventDates: eventsTable.eventDates })
		.from(eventsTable)
		.where(eq(eventsTable.eventId, eventId))
		.limit(1);

	const eventRow = eventRows[0];
	if (!eventRow) {
		return null;
	}

	const volunteers = await db
		.select({
			code: volunteersTable.code,
			name: volunteersTable.name,
			participationDates: volunteersTable.participationDates,
			volunteerId: volunteersTable.volunteerId,
		})
		.from(volunteersTable)
		.where(eq(volunteersTable.eventId, eventId));

	const volunteerIds = volunteers.map((v) => v.volunteerId);

	const attendanceRecords =
		volunteerIds.length > 0
			? await db
					.select({
						recordedAt: attendanceRecordsTable.recordedAt,
						volunteerId: attendanceRecordsTable.volunteerId,
					})
					.from(attendanceRecordsTable)
					.where(inArray(attendanceRecordsTable.volunteerId, volunteerIds))
			: [];

	const attendedDates = new Map<string, Set<string>>();
	for (const record of attendanceRecords) {
		const volunteerId = record.volunteerId;
		const dateStr = record.recordedAt.toISOString().slice(0, 10);

		if (!attendedDates.has(volunteerId)) {
			attendedDates.set(volunteerId, new Set());
		}
		attendedDates.get(volunteerId)?.add(dateStr);
	}

	const volunteerStatuses: VolunteerAttendanceStatus[] = volunteers.map(
		(volunteer) => {
			const attendedDatesForVolunteer = attendedDates.get(
				volunteer.volunteerId,
			);
			const attendanceByDate: Record<string, boolean> = {};

			for (const date of volunteer.participationDates) {
				attendanceByDate[date] = attendedDatesForVolunteer?.has(date) ?? false;
			}

			return {
				attendanceByDate,
				participationDates: volunteer.participationDates,
				volunteerCode: volunteer.code,
				volunteerId: volunteer.volunteerId,
				volunteerName: volunteer.name,
			};
		},
	);

	return {
		eventDates: eventRow.eventDates,
		volunteers: volunteerStatuses,
	};
}
