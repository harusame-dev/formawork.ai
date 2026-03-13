import { DateTime } from "@/components/date-time.client";
import type { UserRole } from "@/features/auth/get-user-role";
import { DeleteTaskCommentDialog } from "../delete/delete-task-comment-dialog.client";
import { EditTaskCommentDialog } from "../edit/edit-task-comment-dialog.client";
import type { TaskComment } from "./get-task-comments";

type TaskCommentsPresenterProps = {
	comments: TaskComment[];
	currentRole: UserRole;
	currentStaffId: string | null;
};

export function TaskCommentsPresenter({
	comments,
	currentRole,
	currentStaffId,
}: TaskCommentsPresenterProps) {
	if (comments.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">コメントはありません</p>
		);
	}

	return (
		<ul className="space-y-3">
			{comments.map((comment) => {
				const canEdit =
					comment.authorId === currentStaffId || currentRole === "admin";

				return (
					<li className="rounded-md border p-3 text-sm" key={comment.commentId}>
						<div className="flex items-center justify-between gap-2 mb-1">
							<span className="font-medium text-muted-foreground">
								{comment.authorName ?? "不明なユーザー"}
							</span>
							<div className="flex items-center gap-1">
								{canEdit && (
									<>
										<EditTaskCommentDialog
											commentId={comment.commentId}
											content={comment.content}
											taskId={comment.taskId}
										/>
										<DeleteTaskCommentDialog
											commentId={comment.commentId}
											taskId={comment.taskId}
										/>
									</>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
							<DateTime date={comment.createdAt} />
							{comment.createdAt.getTime() !== comment.updatedAt.getTime() && (
								<>
									<span>・</span>
									<span>編集済み</span>
									<DateTime date={comment.updatedAt} />
								</>
							)}
						</div>
						<p className="whitespace-pre-wrap">{comment.content}</p>
					</li>
				);
			})}
		</ul>
	);
}
