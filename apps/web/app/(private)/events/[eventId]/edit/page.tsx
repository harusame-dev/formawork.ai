import { Skeleton } from "@workspace/ui/components/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventForm } from "@/features/event/components/event-form.client";
import { getEvent } from "@/features/event/queries/get-event";

export default function EditEventPage({
	params,
}: PageProps<"/events/[eventId]/edit">) {
	const eventPromise = params.then(({ eventId }) => getEvent(eventId));

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">イベント編集</h2>
			</div>
			<div className="px-6 pb-6">
				<Suspense fallback={<EditEventFormSkeleton />}>
					<EditEventFormContainer eventPromise={eventPromise} />
				</Suspense>
			</div>
		</div>
	);
}

async function EditEventFormContainer({
	eventPromise,
}: {
	eventPromise: Promise<Awaited<ReturnType<typeof getEvent>>>;
}) {
	const event = await eventPromise;
	if (!event) {
		notFound();
	}

	return (
		<EventForm
			defaultValues={{
				description: event.description ?? "",
				eventDates: event.eventDates,
				name: event.name,
			}}
			eventId={event.eventId}
			mode="edit"
		/>
	);
}

function EditEventFormSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-9 max-w-md" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-9 max-w-xs" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-32 max-w-md" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
			</div>
		</div>
	);
}
