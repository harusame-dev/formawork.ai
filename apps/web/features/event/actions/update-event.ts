import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { eventsTable } from "@workspace/db/schema/events";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import * as v from "valibot";
import { EVENT_TAG } from "../tag";
import { eventFormSchema } from "./schema";

export const updateEventSchema = v.object({
	...eventFormSchema.entries,
	eventId: v.pipe(v.string(), v.uuid("イベントIDが不正です")),
});

type UpdateEventParams = v.InferOutput<typeof updateEventSchema>;

const UpdateEventError = "イベントの更新に失敗しました" as const;
const EventNotFoundError = "イベントが見つかりません" as const;

type UpdateEventErrorType = typeof UpdateEventError | typeof EventNotFoundError;

export async function updateEvent(
	params: UpdateEventParams,
): Promise<Result<void, UpdateEventErrorType>> {
	const uniqueDates = [...new Set(params.eventDates)].sort();

	const rows = await db
		.update(eventsTable)
		.set({
			description: params.description || null,
			eventDates: uniqueDates,
			name: params.name,
		})
		.where(eq(eventsTable.eventId, params.eventId))
		.returning({ eventId: eventsTable.eventId });

	if (rows.length === 0) {
		return fail(EventNotFoundError);
	}

	revalidateTag(EVENT_TAG, "max");

	return succeed();
}
