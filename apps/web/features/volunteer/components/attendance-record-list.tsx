type AttendanceRecord = {
	attendanceRecordId: string;
	recordedAt: Date;
};

type AttendanceRecordListProps = {
	records: AttendanceRecord[];
};

function formatRecordedAt(recordedAt: Date): string {
	return new Date(recordedAt).toLocaleString("ja-JP", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "2-digit",
		second: "2-digit",
		timeZone: "Asia/Tokyo",
		year: "numeric",
	});
}

export function AttendanceRecordList({ records }: AttendanceRecordListProps) {
	if (records.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">来場記録がありません</p>
		);
	}

	return (
		<ul className="space-y-2">
			{records.map((record) => (
				<li
					className="rounded-md border px-4 py-2 text-sm"
					key={record.attendanceRecordId}
				>
					{formatRecordedAt(record.recordedAt)}
				</li>
			))}
		</ul>
	);
}
