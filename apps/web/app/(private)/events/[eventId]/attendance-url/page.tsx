import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Suspense } from "react";
import { AttendanceUrlManager } from "@/features/attendance-url/components/attendance-url-manager";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/attendance-url">) {
	const eventIdPromise = params.then(({ eventId }) => eventId);

	return (
		<div className="p-4">
			<Card>
				<CardHeader>
					<CardTitle>来場ページURL管理</CardTitle>
				</CardHeader>
				<CardContent>
					<Suspense>
						<AttendanceUrlManagerContainer eventIdPromise={eventIdPromise} />
					</Suspense>
				</CardContent>
			</Card>
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
