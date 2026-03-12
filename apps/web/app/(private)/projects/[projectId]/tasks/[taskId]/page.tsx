import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { TaskDetailContainer } from "@/features/task/detail/task-detail.server";
import { TaskDetailSkeleton } from "@/features/task/detail/task-detail-skeleton.universal";
import { TaskCommentsContainer } from "@/features/task-comment/list/task-comments.server";
import { PostTaskCommentFormContainer } from "@/features/task-comment/post/post-task-comment-form.server";

export default function Page({
	params,
}: PageProps<"/projects/[projectId]/tasks/[taskId]">) {
	const taskIdPromise = params.then(({ taskId }) => taskId);

	return (
		<Card className="p-4 space-y-6">
			<Suspense fallback={<TaskDetailSkeleton />}>
				<TaskDetailContainer taskIdPromise={taskIdPromise} />
			</Suspense>
			<div>
				<p className="text-sm font-normal text-muted-foreground mb-2">
					コメント
				</p>
				<Suspense fallback={<div className="sr-only">読み込み中</div>}>
					<TaskCommentsContainer taskIdPromise={taskIdPromise} />
				</Suspense>
				<Suspense fallback={null}>
					<PostTaskCommentFormContainer taskIdPromise={taskIdPromise} />
				</Suspense>
			</div>
		</Card>
	);
}
