import { notFound } from "next/navigation";
import { getEvent } from "@/features/event/queries/get-event";
import { VolunteerListContainer } from "./volunteer-list-container.server";

type VolunteerPageContainerProps = {
	eventIdPromise: Promise<string>;
};

export async function VolunteerPageContainer({
	eventIdPromise,
}: VolunteerPageContainerProps) {
	const eventId = await eventIdPromise;
	const event = await getEvent(eventId);

	if (!event) {
		notFound();
	}

	return (
		<div className="rounded-lg border bg-card">
			<VolunteerListContainer eventIdPromise={Promise.resolve(eventId)} />
		</div>
	);
}
