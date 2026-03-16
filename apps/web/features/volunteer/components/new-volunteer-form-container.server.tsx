import { notFound } from "next/navigation";
import { getEvent } from "@/features/event/queries/get-event";
import { VolunteerForm } from "./volunteer-form.client";

type NewVolunteerFormContainerProps = {
	eventIdPromise: Promise<string>;
};

export async function NewVolunteerFormContainer({
	eventIdPromise,
}: NewVolunteerFormContainerProps) {
	const eventId = await eventIdPromise;
	const event = await getEvent(eventId);

	if (!event) {
		notFound();
	}

	return <VolunteerForm eventDates={event.eventDates} eventId={eventId} />;
}
