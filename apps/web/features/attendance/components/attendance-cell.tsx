type AttendanceCellProps = {
	/** 参加予定かどうか */
	isParticipationDate: boolean;
	/** 来場済みかどうか（参加予定日の場合のみ意味を持つ） */
	hasAttendance?: boolean;
};

export function AttendanceCell({
	isParticipationDate,
	hasAttendance,
}: AttendanceCellProps) {
	if (!isParticipationDate) {
		return <span className="text-muted-foreground">ー</span>;
	}

	if (hasAttendance) {
		return <span className="text-green-600">◯</span>;
	}

	return <span className="text-red-500">✖️</span>;
}
