import { Button } from "@workspace/ui/components/button";
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

export default function EventsPage() {
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">イベント一覧</h1>
				<Button asChild>
					<Link href="/events/new">新規作成</Link>
				</Button>
			</div>
			<div className="rounded-lg border bg-card">
				<Suspense fallback={<EventListSkeleton />}>
					<EventList />
				</Suspense>
			</div>
		</div>
	);
}
