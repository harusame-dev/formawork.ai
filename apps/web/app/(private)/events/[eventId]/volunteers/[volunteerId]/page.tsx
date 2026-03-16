import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VolunteerDetail } from "@/features/volunteer/components/volunteer-detail";
import { getVolunteerWithRecords } from "@/features/volunteer/queries/get-volunteer-with-records";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers/[volunteerId]">) {
	const paramsPromise = params;
	return (
		<Suspense>
			<VolunteerDetailContainer paramsPromise={paramsPromise} />
		</Suspense>
	);
}

async function VolunteerDetailContainer({
	paramsPromise,
}: {
	paramsPromise: Promise<{ eventId: string; volunteerId: string }>;
}) {
	const { eventId, volunteerId } = await paramsPromise;
	const volunteer = await getVolunteerWithRecords(volunteerId);

	if (!volunteer) {
		notFound();
	}

	return <VolunteerDetail eventId={eventId} volunteer={volunteer} />;
}
