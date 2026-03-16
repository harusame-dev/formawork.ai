import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VolunteerDetail } from "@/features/volunteer/components/volunteer-detail";
import { getVolunteerWithRecords } from "@/features/volunteer/queries/get-volunteer-with-records";

export default function Page({
	params,
}: PageProps<"/events/[eventId]/volunteers/[volunteerId]">) {
	const paramsPromise = params;
	return (
		<div className="flex flex-col">
			<div className="px-6 py-4">
				<h2 className="text-xl font-bold">ボランティア詳細</h2>
			</div>
			<div className="px-6 pb-6">
				<Suspense>
					<VolunteerDetailContainer paramsPromise={paramsPromise} />
				</Suspense>
			</div>
		</div>
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
