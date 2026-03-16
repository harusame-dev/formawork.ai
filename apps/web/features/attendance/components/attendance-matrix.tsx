import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import type { AttendanceStatus } from "../queries/get-attendance-status";
import { AttendanceCell } from "./attendance-cell";

type AttendanceMatrixProps = {
	eventId: string;
	attendanceStatus: AttendanceStatus;
};

function formatDateHeader(date: string): string {
	const [, month, day] = date.split("-");
	return `${Number(month)}/${Number(day)}`;
}

export function AttendanceMatrix({
	eventId,
	attendanceStatus,
}: AttendanceMatrixProps) {
	const { eventDates, volunteers } = attendanceStatus;

	if (volunteers.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				ボランティアが登録されていません
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>氏名</TableHead>
					{eventDates.map((date) => (
						<TableHead className="w-px whitespace-nowrap text-center" key={date}>
							{formatDateHeader(date)}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{volunteers.map((volunteer) => (
					<TableRow key={volunteer.volunteerId}>
						<TableCell>
							<Link
								className="text-primary underline"
								href={`/events/${eventId}/volunteers/${volunteer.volunteerId}`}
							>
								{volunteer.volunteerName}
							</Link>
						</TableCell>
						{eventDates.map((date) => {
							const isParticipationDate =
								volunteer.participationDates.includes(date);
							const hasAttendance = isParticipationDate
								? volunteer.attendanceByDate[date]
								: undefined;

							return (
								<TableCell className="w-px whitespace-nowrap text-center" key={date}>
									<AttendanceCell
										hasAttendance={hasAttendance}
										isParticipationDate={isParticipationDate}
									/>
								</TableCell>
							);
						})}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
