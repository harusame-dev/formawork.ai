import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { NewVolunteerFormContainer } from "@/features/volunteer/components/new-volunteer-form-container.server";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers/new">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">ボランティア登録</h2>
			</div>
			<div className="px-6 pb-6">
				<Card className="p-4 w-full max-w-xl">
					<Suspense fallback={<Skeleton className="h-40 w-full" />}>
						<NewVolunteerFormContainer eventIdPromise={eventIdPromise} />
					</Suspense>
				</Card>
			</div>
		</div>
	);
}
