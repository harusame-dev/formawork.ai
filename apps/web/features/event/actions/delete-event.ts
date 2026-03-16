import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { eventsTable } from "@workspace/db/schema/events";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import * as v from "valibot";
import { EVENT_TAG } from "../tag";

export const deleteEventSchema = v.object({
	eventId: v.pipe(v.string(), v.uuid("イベントIDが不正です")),
});

type DeleteEventParams = v.InferOutput<typeof deleteEventSchema>;

const DeleteEventError = "イベントの削除に失敗しました" as const;
const EventNotFoundError = "イベントが見つかりません" as const;

type DeleteEventErrorType = typeof DeleteEventError | typeof EventNotFoundError;

export async function deleteEvent(
	params: DeleteEventParams,
): Promise<Result<void, DeleteEventErrorType>> {
	const rows = await db
		.delete(eventsTable)
		.where(eq(eventsTable.eventId, params.eventId))
		.returning({ eventId: eventsTable.eventId });

	if (rows.length === 0) {
		return fail(EventNotFoundError);
	}

	revalidateTag(EVENT_TAG, "max");

	return succeed();
}
