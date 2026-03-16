import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { EditVolunteerFormContainer } from "@/features/volunteer/components/edit-volunteer-form-container.server";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers/[volunteerId]/edit">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);
	const volunteerIdPromise = params.then(({ volunteerId }) => volunteerId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">ボランティア編集</h1>
			<Card className="p-4 w-full">
				<Suspense fallback={<Skeleton className="h-40 w-full" />}>
					<EditVolunteerFormContainer
						eventIdPromise={eventIdPromise}
						volunteerIdPromise={volunteerIdPromise}
					/>
				</Suspense>
			</Card>
		</div>
	);
}
