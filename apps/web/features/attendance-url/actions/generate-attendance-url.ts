import { type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { eventAttendanceUrlsTable } from "@workspace/db/schema/event-attendance-urls";
import { eq } from "drizzle-orm";

type GenerateAttendanceUrlInput = {
	eventId: string;
};

export async function generateAttendanceUrl({
	eventId,
}: GenerateAttendanceUrlInput): Promise<Result<undefined, never>> {
	const existing = await db
		.select({
			eventAttendanceUrlId: eventAttendanceUrlsTable.eventAttendanceUrlId,
		})
		.from(eventAttendanceUrlsTable)
		.where(eq(eventAttendanceUrlsTable.eventId, eventId))
		.limit(1);

	if (existing.length > 0) {
		await db
			.update(eventAttendanceUrlsTable)
			.set({ token: crypto.randomUUID() })
			.where(eq(eventAttendanceUrlsTable.eventId, eventId));
	} else {
		await db
			.insert(eventAttendanceUrlsTable)
			.values({ eventId, token: crypto.randomUUID() });
	}

	return succeed();
}
