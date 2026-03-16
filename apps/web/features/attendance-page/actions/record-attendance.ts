import { succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { attendanceRecordsTable } from "@workspace/db/schema/attendance-records";

type RecordAttendanceInput = {
	volunteerId: string;
};

type RecordAttendanceResult = {
	recordedAt: Date;
};

export async function recordAttendance({ volunteerId }: RecordAttendanceInput) {
	const rows = await db
		.insert(attendanceRecordsTable)
		.values({ volunteerId })
		.returning({ recordedAt: attendanceRecordsTable.recordedAt });

	const row = rows[0];
	if (!row) {
		throw new Error("来場記録の登録に失敗しました");
	}

	return succeed<RecordAttendanceResult>({ recordedAt: row.recordedAt });
}
