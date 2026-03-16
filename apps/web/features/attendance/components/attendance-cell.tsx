import { Check, Minus, X } from "lucide-react";

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
		return <Minus className="size-4 text-muted-foreground mx-auto" />;
	}

	if (hasAttendance) {
		return <Check className="size-4 text-green-600 mx-auto" />;
	}

	return <X className="size-4 text-red-500 mx-auto" />;
}
