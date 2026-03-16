import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
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

export async function EventList({ page }: { page: number }) {
	const { events, totalPages } = await getEvents(page);

	if (events.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				イベントがまだ登録されていません。
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>イベント名</TableHead>
						<TableHead>開催日</TableHead>
						<TableHead className="text-right">ボランティア登録数</TableHead>
						<TableHead>作成日時</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{events.map((event) => (
						<TableRow key={event.eventId}>
							<TableCell className="font-medium">
								<Link className="underline" href={`/events/${event.eventId}`}>
									{event.name}
								</Link>
							</TableCell>
							<TableCell>{formatEventDates(event.eventDates)}</TableCell>
							<TableCell className="text-right">
								{event.volunteerCount}人
							</TableCell>
							<TableCell className="text-muted-foreground">
								{formatDate(event.createdAt)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="px-4 pb-4">
				<SearchPagination currentPage={page} totalPages={totalPages} />
			</div>
		</div>
	);
}
