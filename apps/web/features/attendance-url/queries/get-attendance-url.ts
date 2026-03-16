import { db } from "@workspace/db/client";
import { eventAttendanceUrlsTable } from "@workspace/db/schema/event-attendance-urls";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ATTENDANCE_URL_TAG } from "../tag";

export async function getAttendanceUrl(eventId: string) {
	"use cache: private";
	cacheTag(ATTENDANCE_URL_TAG);

	const results = await db
		.select()
		.from(eventAttendanceUrlsTable)
		.where(eq(eventAttendanceUrlsTable.eventId, eventId))
		.limit(1);

	return results[0] ?? null;
}
