import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { VolunteerPageContainer } from "@/features/volunteer/components/volunteer-page-container.server";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between px-6 py-4">
				<h2 className="text-xl font-bold">ボランティア管理</h2>
				<Suspense fallback={<Skeleton className="h-4 w-14" />}>
					<NewVolunteerLink eventIdPromise={eventIdPromise} />
				</Suspense>
			</div>
			<div className="px-6 pb-6 space-y-4">
				<Suspense fallback={<Skeleton className="h-8 w-full" />}>
					<VolunteerPageContainer eventIdPromise={eventIdPromise} />
				</Suspense>
			</div>
		</div>
	);
}

async function NewVolunteerLink({
	eventIdPromise,
}: {
	eventIdPromise: Promise<string>;
}) {
	const eventId = await eventIdPromise;
	return (
		<Link
			className="text-sm underline"
			href={`/events/${eventId}/volunteers/new`}
		>
			新規登録
		</Link>
	);
}
