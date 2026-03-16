import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { AttendanceMatrixContainer } from "@/features/attendance/components/attendance-matrix-container.server";

export default function EventDetailPage({
	params,
}: PageProps<"/events/[eventId]">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">来場状況一覧</h2>
			</div>
			<div className="px-6 pb-6">
				<Suspense fallback={<Skeleton className="h-64 w-full" />}>
					<AttendanceMatrixContainer eventIdPromise={eventIdPromise} />
				</Suspense>
			</div>
		</div>
	);
}
