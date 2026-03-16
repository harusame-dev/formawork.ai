import { getAttendanceStatus } from "../queries/get-attendance-status";
import { AttendanceMatrix } from "./attendance-matrix";

type AttendanceMatrixContainerProps = {
	eventIdPromise: Promise<string>;
};

export async function AttendanceMatrixContainer({
	eventIdPromise,
}: AttendanceMatrixContainerProps) {
	const eventId = await eventIdPromise;
	const attendanceStatus = await getAttendanceStatus(eventId);

	if (!attendanceStatus) {
		return null;
	}

	return (
		<AttendanceMatrix attendanceStatus={attendanceStatus} eventId={eventId} />
	);
}
