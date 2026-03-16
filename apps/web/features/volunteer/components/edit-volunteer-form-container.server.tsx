import { notFound } from "next/navigation";
import { getEvent } from "@/features/event/queries/get-event";
import { getVolunteer } from "../queries/get-volunteer";
import { VolunteerForm } from "./volunteer-form.client";

type EditVolunteerFormContainerProps = {
	eventIdPromise: Promise<string>;
	volunteerIdPromise: Promise<string>;
};

export async function EditVolunteerFormContainer({
	eventIdPromise,
	volunteerIdPromise,
}: EditVolunteerFormContainerProps) {
	const [eventId, volunteerId] = await Promise.all([
		eventIdPromise,
		volunteerIdPromise,
	]);

	const [event, volunteer] = await Promise.all([
		getEvent(eventId),
		getVolunteer(volunteerId),
	]);

	if (!event || !volunteer) {
		notFound();
	}

	return (
		<VolunteerForm
			eventDates={event.eventDates}
			eventId={eventId}
			initialValues={{
				code: volunteer.code,
				gender: volunteer.gender,
				name: volunteer.name,
				participationDates: volunteer.participationDates,
			}}
			volunteerId={volunteerId}
		/>
	);
}
