import { Suspense } from "react";
import { AttendanceUrlManager } from "@/features/attendance-url/components/attendance-url-manager";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/attendance-url">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">来場ページURL管理</h2>
			</div>
			<div className="px-6 pb-6">
				<Suspense>
					<AttendanceUrlManagerContainer eventIdPromise={eventIdPromise} />
				</Suspense>
			</div>
		</div>
	);
}

async function AttendanceUrlManagerContainer({
	eventIdPromise,
}: {
	eventIdPromise: Promise<string>;
}) {
	const eventId = await eventIdPromise;
	return <AttendanceUrlManager eventId={eventId} />;
}
