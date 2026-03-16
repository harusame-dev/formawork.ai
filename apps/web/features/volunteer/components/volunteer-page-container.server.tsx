import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/features/event/queries/get-event";
import { VolunteerListContainer } from "./volunteer-list-container.server";

type VolunteerPageContainerProps = {
	eventIdPromise: Promise<string>;
};

export async function VolunteerPageContainer({
	eventIdPromise,
}: VolunteerPageContainerProps) {
	const eventId = await eventIdPromise;
	const event = await getEvent(eventId);

	if (!event) {
		notFound();
	}

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="font-bold">ボランティア一覧</h1>
				<Button asChild>
					<Link href={`/events/${eventId}/volunteers/new`}>新規登録</Link>
				</Button>
			</div>
			<Card className="py-2 w-full">
				<VolunteerListContainer eventIdPromise={Promise.resolve(eventId)} />
			</Card>
		</>
	);
}
