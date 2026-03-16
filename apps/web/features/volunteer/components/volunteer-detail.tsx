import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { AttendanceRecordList } from "./attendance-record-list";
import { DeleteVolunteerDialog } from "./delete-volunteer-dialog.client";

type AttendanceRecord = {
	attendanceRecordId: string;
	recordedAt: Date;
};

type VolunteerDetailProps = {
	eventId: string;
	volunteer: {
		attendanceRecords: AttendanceRecord[];
		code: string;
		gender: string | null;
		name: string;
		participationDates: string[];
		volunteerId: string;
	};
};

const GENDER_LABELS: Record<string, string> = {
	female: "女性",
	male: "男性",
	other: "その他",
};

export function VolunteerDetail({ eventId, volunteer }: VolunteerDetailProps) {
	const genderLabel = volunteer.gender
		? (GENDER_LABELS[volunteer.gender] ?? volunteer.gender)
		: "-";

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Link
					className="text-muted-foreground text-sm hover:underline"
					href={`/events/${eventId}/volunteers`}
				>
					← ボランティア一覧へ戻る
				</Link>
				<div className="flex gap-2">
					<Button asChild size="sm" variant="outline">
						<Link
							href={`/events/${eventId}/volunteers/${volunteer.volunteerId}/edit`}
						>
							編集
						</Link>
					</Button>
					<DeleteVolunteerDialog
						eventId={eventId}
						volunteerId={volunteer.volunteerId}
						volunteerName={volunteer.name}
					/>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>登録情報</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<div className="text-muted-foreground text-sm">氏名</div>
						<div className="font-bold">{volunteer.name}</div>
					</div>
					<div className="grid gap-2">
						<div className="text-muted-foreground text-sm">ID（コード）</div>
						<div className="font-bold">{volunteer.code}</div>
					</div>
					<div className="grid gap-2">
						<div className="text-muted-foreground text-sm">性別</div>
						<div className="font-bold">{genderLabel}</div>
					</div>
					<div className="grid gap-2">
						<div className="text-muted-foreground text-sm">参加予定日</div>
						<div className="font-bold">
							{volunteer.participationDates.length > 0 ? (
								<ul className="space-y-1">
									{volunteer.participationDates.map((date) => (
										<li key={date}>{date}</li>
									))}
								</ul>
							) : (
								"-"
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>来場記録</CardTitle>
				</CardHeader>
				<CardContent>
					<AttendanceRecordList records={volunteer.attendanceRecords} />
				</CardContent>
			</Card>
		</div>
	);
}
