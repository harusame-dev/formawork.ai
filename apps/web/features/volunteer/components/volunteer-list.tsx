import type { SelectVolunteer } from "@workspace/db/schema/volunteers";
import { Button } from "@workspace/ui/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import { DeleteVolunteerDialog } from "./delete-volunteer-dialog.client";

type VolunteerListProps = {
	eventId: string;
	volunteers: SelectVolunteer[];
};

function formatDate(date: string): string {
	const [year, month, day] = date.split("-");
	return `${year}/${month}/${day}`;
}

export function VolunteerList({ eventId, volunteers }: VolunteerListProps) {
	if (!volunteers.length) {
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
					<TableHead>ID</TableHead>
					<TableHead>性別</TableHead>
					<TableHead>参加予定日</TableHead>
					<TableHead className="w-[120px]">操作</TableHead>
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
								{volunteer.name}
							</Link>
						</TableCell>
						<TableCell>{volunteer.code}</TableCell>
						<TableCell>{volunteer.gender ?? "-"}</TableCell>
						<TableCell>
							{volunteer.participationDates.map(formatDate).join("、")}
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
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
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
