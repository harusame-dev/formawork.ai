import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { NewVolunteerFormContainer } from "@/features/volunteer/components/new-volunteer-form-container.server";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers/new">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">ボランティア登録</h1>
			<Card className="p-4 w-full">
				<Suspense fallback={<Skeleton className="h-40 w-full" />}>
					<NewVolunteerFormContainer eventIdPromise={eventIdPromise} />
				</Suspense>
			</Card>
		</div>
	);
}
