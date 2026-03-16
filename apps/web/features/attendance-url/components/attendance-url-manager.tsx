import { getAttendanceUrl } from "../queries/get-attendance-url";
import { AttendanceUrlDisplay } from "./attendance-url-display.client";
import { GenerateUrlButton } from "./generate-url-button.client";

type AttendanceUrlManagerProps = {
	eventId: string;
};

export async function AttendanceUrlManager({
	eventId,
}: AttendanceUrlManagerProps) {
	const attendanceUrl = await getAttendanceUrl(eventId);

	if (!attendanceUrl) {
		return (
			<div className="flex flex-col items-center gap-4 py-8 text-center">
				<p className="text-muted-foreground">URLが生成されていません</p>
				<GenerateUrlButton eventId={eventId} />
			</div>
		);
	}

	return <AttendanceUrlDisplay eventId={eventId} token={attendanceUrl.token} />;
}
