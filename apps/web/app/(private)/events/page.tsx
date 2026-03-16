import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { EventList } from "@/features/event/components/event-list";

function EventListSkeleton() {
	return (
		<div className="space-y-2 px-4 py-3">
			{Array.from({ length: 5 }).map((_, i) => (
				<Skeleton className="h-12 w-full" key={String(i)} />
			))}
		</div>
	);
}

export default function EventsPage({ searchParams }: PageProps<"/events">) {
	const pagePromise = searchParams.then((params) =>
		Math.max(1, Number(params["page"]) || 1),
	);

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between px-6 py-4">
				<h1 className="text-xl font-bold">イベント一覧</h1>
				<Link className="text-sm underline" href="/events/new">
					新規登録
				</Link>
			</div>
			<div className="px-6 pb-6">
				<div className="rounded-lg border bg-card">
					<Suspense fallback={<EventListSkeleton />}>
						<EventListContainer pagePromise={pagePromise} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

async function EventListContainer({
	pagePromise,
}: {
	pagePromise: Promise<number>;
}) {
	const page = await pagePromise;
	return <EventList page={page} />;
}
