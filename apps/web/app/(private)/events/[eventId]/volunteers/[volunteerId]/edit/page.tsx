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
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">ボランティア編集</h2>
			</div>
			<div className="px-6 pb-6">
				<Card className="p-4 w-full max-w-xl">
					<Suspense fallback={<Skeleton className="h-40 w-full" />}>
						<EditVolunteerFormContainer
							eventIdPromise={eventIdPromise}
							volunteerIdPromise={volunteerIdPromise}
						/>
					</Suspense>
				</Card>
			</div>
		</div>
	);
}
