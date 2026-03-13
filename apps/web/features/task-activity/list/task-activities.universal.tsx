import { DateTime } from "@/components/date-time.client";
import type { UserRole } from "@/features/auth/get-user-role";
import { TaskStatusLabel } from "@/features/task/status";
import { DeleteTaskCommentDialog } from "../delete/delete-task-comment-dialog.client";
import { EditTaskCommentDialog } from "../edit/edit-task-comment-dialog.client";
import type { TaskActivity } from "./get-task-activities";

type TaskActivitiesPresenterProps = {
	activities: TaskActivity[];
	currentRole: UserRole;
	currentStaffId: string | null;
};

type StatusChangedMetadata = {
	from: string;
	to: string;
};

function isStatusChangedMetadata(
	value: unknown,
): value is StatusChangedMetadata {
	return (
		typeof value === "object" &&
		value !== null &&
		"from" in value &&
		"to" in value &&
		typeof (value as StatusChangedMetadata).from === "string" &&
		typeof (value as StatusChangedMetadata).to === "string"
	);
}

function getStatusLabel(status: string): string {
	return TaskStatusLabel[status as keyof typeof TaskStatusLabel] ?? status;
}

export function TaskActivitiesPresenter({
	activities,
	currentRole,
	currentStaffId,
}: TaskActivitiesPresenterProps) {
	if (activities.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				アクティビティはありません
			</p>
		);
	}

	return (
		<ul className="space-y-3">
			{activities.map((activity) => {
				if (activity.type === "comment") {
					const canEdit =
						activity.authorId === currentStaffId || currentRole === "admin";

					return (
						<li
							className="rounded-md border p-3 text-sm"
							key={activity.activityId}
						>
							<div className="flex items-center justify-between gap-2 mb-1">
								<span className="font-medium text-muted-foreground">
									{activity.authorName ?? "不明なユーザー"}
								</span>
								<div className="flex items-center gap-1">
									{canEdit && (
										<>
											<EditTaskCommentDialog
												activityId={activity.activityId}
												content={activity.content ?? ""}
												taskId={activity.taskId}
											/>
											<DeleteTaskCommentDialog
												activityId={activity.activityId}
												taskId={activity.taskId}
											/>
										</>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
								<DateTime date={activity.createdAt} />
								{activity.createdAt.getTime() !==
									activity.updatedAt.getTime() && (
									<>
										<span>・</span>
										<span>編集済み</span>
										<DateTime date={activity.updatedAt} />
									</>
								)}
							</div>
							<p className="whitespace-pre-wrap">{activity.content}</p>
						</li>
					);
				}

				if (
					activity.type === "status_changed" &&
					isStatusChangedMetadata(activity.metadata)
				) {
					return (
						<li
							className="rounded-md border p-3 text-sm"
							key={activity.activityId}
						>
							<div className="flex items-center gap-2 text-muted-foreground">
								<span>
									{activity.authorName ?? "不明なユーザー"}
									{" がステータスを「"}
									{getStatusLabel(activity.metadata.from)}
									{"」から「"}
									{getStatusLabel(activity.metadata.to)}
									{"」に変更しました"}
								</span>
							</div>
							<div className="text-xs text-muted-foreground mt-1">
								<DateTime date={activity.createdAt} />
							</div>
						</li>
					);
				}

				return null;
			})}
		</ul>
	);
}
