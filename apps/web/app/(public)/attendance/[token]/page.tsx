import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AttendancePage } from "@/features/attendance-page/components/attendance-page.client";
import { getEventByToken } from "@/features/attendance-page/queries/get-event-by-token";

export default function Page({ params }: PageProps<"/attendance/[token]">) {
	const tokenPromise = params.then(({ token }) => token);

	return (
		<Suspense>
			<AttendancePageContainer tokenPromise={tokenPromise} />
		</Suspense>
	);
}

async function AttendancePageContainer({
	tokenPromise,
}: {
	tokenPromise: Promise<string>;
}) {
	const token = await tokenPromise;
	const event = await getEventByToken(token);

	if (!event) {
		notFound();
	}

	return <AttendancePage eventId={event.eventId} eventName={event.eventName} />;
}
