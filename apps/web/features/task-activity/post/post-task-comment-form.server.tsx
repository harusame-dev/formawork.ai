import { PostTaskCommentForm } from "./post-task-comment-form.client";

type PostTaskCommentFormContainerProps = {
	taskIdPromise: Promise<string>;
};

export async function PostTaskCommentFormContainer({
	taskIdPromise,
}: PostTaskCommentFormContainerProps) {
	const taskId = await taskIdPromise;
	return <PostTaskCommentForm taskId={taskId} />;
}
