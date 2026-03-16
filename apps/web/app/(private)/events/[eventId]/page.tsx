import { Skeleton } from "@workspace/ui/components/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AttendanceMatrixContainer } from "@/features/attendance/components/attendance-matrix-container.server";
import { getEvent } from "@/features/event/queries/get-event";

export default function EventDetailPage({
	params,
}: PageProps<"/events/[eventId]">) {
	const eventPromise = params.then(({ eventId }) => getEvent(eventId));
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="p-6">
			<Suspense fallback={<Skeleton className="h-8 w-64" />}>
				<EventDetailContent eventPromise={eventPromise} />
			</Suspense>
			<Suspense fallback={<Skeleton className="h-64 w-full" />}>
				<AttendanceMatrixContainer eventIdPromise={eventIdPromise} />
			</Suspense>
		</div>
	);
}

async function EventDetailContent({
	eventPromise,
}: {
	eventPromise: Promise<Awaited<ReturnType<typeof getEvent>>>;
}) {
	const event = await eventPromise;
	if (!event) {
		notFound();
	}

	return <h1 className="mb-4 text-2xl font-bold">{event.name}</h1>;
}
