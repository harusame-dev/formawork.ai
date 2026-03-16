import { Skeleton } from "@workspace/ui/components/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventDetailNav } from "@/features/event/components/event-detail-nav";
import { getEvent } from "@/features/event/queries/get-event";

export default function EventLayout({
	children,
	params,
}: LayoutProps<"/events/[eventId]">) {
	const eventPromise = params.then(({ eventId }) => getEvent(eventId));

	return (
		<div className="flex h-full">
			<Suspense fallback={<EventNavSkeleton />}>
				<EventDetailNavContainer eventPromise={eventPromise} />
			</Suspense>
			<div className="flex-1 overflow-y-auto">{children}</div>
		</div>
	);
}

async function EventDetailNavContainer({
	eventPromise,
}: {
	eventPromise: Promise<Awaited<ReturnType<typeof getEvent>>>;
}) {
	const event = await eventPromise;
	if (!event) {
		notFound();
	}
	return <EventDetailNav eventId={event.eventId} eventName={event.name} />;
}

function EventNavSkeleton() {
	return (
		<div className="flex flex-col gap-2 border-r p-4 min-w-48">
			<Skeleton className="mb-2 h-4 w-20" />
			{Array.from({ length: 6 }).map((_, i) => (
				<Skeleton className="h-8 w-full" key={String(i)} />
			))}
		</div>
	);
}
