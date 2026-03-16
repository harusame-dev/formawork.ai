import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { VolunteerPageContainer } from "@/features/volunteer/components/volunteer-page-container.server";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<Suspense fallback={<Skeleton className="h-8 w-full" />}>
				<VolunteerPageContainer eventIdPromise={eventIdPromise} />
			</Suspense>
		</div>
	);
}
