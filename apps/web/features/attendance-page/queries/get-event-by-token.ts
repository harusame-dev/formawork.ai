import { db } from "@workspace/db/client";
import { eventAttendanceUrlsTable } from "@workspace/db/schema/event-attendance-urls";
import { eventsTable } from "@workspace/db/schema/events";
import { eq } from "drizzle-orm";

type EventByToken = {
	eventId: string;
	eventName: string;
	token: string;
};

export async function getEventByToken(
	token: string,
): Promise<EventByToken | null> {
	const rows = await db
		.select({
			eventId: eventsTable.eventId,
			eventName: eventsTable.name,
			token: eventAttendanceUrlsTable.token,
		})
		.from(eventAttendanceUrlsTable)
		.innerJoin(
			eventsTable,
			eq(eventAttendanceUrlsTable.eventId, eventsTable.eventId),
		)
		.where(eq(eventAttendanceUrlsTable.token, token))
		.limit(1);

	return rows[0] ?? null;
}
