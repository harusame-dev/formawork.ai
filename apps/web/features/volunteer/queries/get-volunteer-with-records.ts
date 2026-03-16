import { db } from "@workspace/db/client";
import { attendanceRecordsTable } from "@workspace/db/schema/attendance-records";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { VolunteerTag } from "../tag";

export async function getVolunteerWithRecords(volunteerId: string) {
	"use cache: private";
	cacheTag(VolunteerTag.Detail(volunteerId));

	const volunteers = await db
		.select()
		.from(volunteersTable)
		.where(eq(volunteersTable.volunteerId, volunteerId))
		.limit(1);

	const volunteer = volunteers[0];
	if (!volunteer) {
		return null;
	}

	const attendanceRecords = await db
		.select()
		.from(attendanceRecordsTable)
		.where(eq(attendanceRecordsTable.volunteerId, volunteerId))
		.orderBy(desc(attendanceRecordsTable.recordedAt));

	return {
		...volunteer,
		attendanceRecords,
	};
}
