import { db } from "@workspace/db/client";
import { eventsTable } from "@workspace/db/schema/events";
import { volunteersTable } from "@workspace/db/schema/volunteers";
import { count, eq, sql } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { EVENT_TAG } from "../tag";

type EventListItem = {
	eventId: string;
	name: string;
	eventDates: string[];
	volunteerCount: number;
	createdAt: Date;
};

type GetEventsResult = {
	events: EventListItem[];
	page: number;
	totalPages: number;
};

const PAGE_SIZE = 20;

export async function getEvents(page = 1): Promise<GetEventsResult> {
	"use cache: private";
	cacheTag(EVENT_TAG);

	const events = await db
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
		.orderBy(eventsTable.createdAt)
		.limit(PAGE_SIZE)
		.offset((page - 1) * PAGE_SIZE);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(eventsTable)
		.then((result) => Number(result[0]?.count ?? 0));

	return {
		events,
		page,
		totalPages: Math.ceil(total / PAGE_SIZE),
	};
}
