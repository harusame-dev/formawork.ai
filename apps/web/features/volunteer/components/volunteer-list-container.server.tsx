import { getVolunteers } from "../queries/get-volunteers";
import { VolunteerList } from "./volunteer-list";

type VolunteerListContainerProps = {
	eventIdPromise: Promise<string>;
};

export async function VolunteerListContainer({
	eventIdPromise,
}: VolunteerListContainerProps) {
	const eventId = await eventIdPromise;
	const volunteers = await getVolunteers(eventId);

	return <VolunteerList eventId={eventId} volunteers={volunteers} />;
}
