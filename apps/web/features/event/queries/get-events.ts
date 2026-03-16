import { db } from "@workspace/db/client";
import { eventsTable } from "@workspace/db/schema/events";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { count, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { EVENT_TAG } from "../tag";

type EventListItem = {
	eventId: string;
	name: string;
	eventDates: string[];
	volunteerCount: number;
	createdAt: Date;
};

export async function getEvents(): Promise<EventListItem[]> {
	"use cache: private";
	cacheTag(EVENT_TAG);

	const rows = await db
		.select({
			createdAt: eventsTable.createdAt,
			eventDates: eventsTable.eventDates,
			eventId: eventsTable.eventId,
			name: eventsTable.name,
			volunteerCount: count(volunteersTable.volunteerId),
		})
		.from(eventsTable)
		.leftJoin(volunteersTable, eq(eventsTable.eventId, volunteersTable.eventId))
		.groupBy(
			eventsTable.eventId,
			eventsTable.name,
			eventsTable.eventDates,
			eventsTable.createdAt,
		)
		.orderBy(eventsTable.createdAt);

	return rows;
}
