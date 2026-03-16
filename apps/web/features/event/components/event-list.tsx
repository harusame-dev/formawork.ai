import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { getEvents } from "../queries/get-events";

function formatEventDates(dates: string[]): string {
	if (dates.length === 0) return "-";
	const sorted = [...dates].sort();
	if (sorted.length === 1) {
		return sorted[0]?.replace(/-/g, "/") ?? "-";
	}
	const first = sorted[0]?.replace(/-/g, "/") ?? "";
	const last = sorted[sorted.length - 1]?.replace(/-/g, "/") ?? "";
	return `${first}〜${last}`;
}

function formatDate(date: Date): string {
	return date
		.toLocaleDateString("ja-JP", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		.replace(/\//g, "/");
}

export async function EventList() {
	const events = await getEvents();

	if (events.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				イベントがまだ登録されていません。
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b text-left">
						<th className="px-4 py-3 font-medium">イベント名</th>
						<th className="px-4 py-3 font-medium">開催日</th>
						<th className="px-4 py-3 font-medium text-right">
							ボランティア登録数
						</th>
						<th className="px-4 py-3 font-medium">作成日時</th>
						<th className="px-4 py-3 font-medium" />
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr className="border-b hover:bg-muted/50" key={event.eventId}>
							<td className="px-4 py-3 font-medium">{event.name}</td>
							<td className="px-4 py-3">
								{formatEventDates(event.eventDates)}
							</td>
							<td className="px-4 py-3 text-right">{event.volunteerCount}人</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDate(event.createdAt)}
							</td>
							<td className="px-4 py-3">
								<Button asChild size="sm" variant="outline">
									<Link href={`/events/${event.eventId}`}>詳細</Link>
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
