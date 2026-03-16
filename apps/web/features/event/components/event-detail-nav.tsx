import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { DeleteEventDialog } from "./delete-event-dialog.client";

type EventDetailNavProps = {
	eventId: string;
	eventName: string;
};

export function EventDetailNav({ eventId, eventName }: EventDetailNavProps) {
	return (
		<nav className="flex flex-col gap-2 border-r p-4 min-w-48">
			<Button asChild className="justify-start" size="sm" variant="ghost">
				<Link href={`/events/${eventId}`}>来場状況一覧</Link>
			</Button>
			<Button asChild className="justify-start" size="sm" variant="ghost">
				<Link href={`/events/${eventId}/volunteers`}>ボランティア管理</Link>
			</Button>
			<Button asChild className="justify-start" size="sm" variant="ghost">
				<Link href={`/events/${eventId}/csv-import`}>CSV取り込み</Link>
			</Button>
			<Button asChild className="justify-start" size="sm" variant="ghost">
				<Link href={`/events/${eventId}/attendance-url`}>
					来場ページURL管理
				</Link>
			</Button>
			<div className="my-2 border-t" />
			<Button asChild className="justify-start" size="sm" variant="ghost">
				<Link href={`/events/${eventId}/edit`}>イベント編集</Link>
			</Button>
			<DeleteEventDialog eventId={eventId} eventName={eventName} />
		</nav>
	);
}
