import { getUserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getTaskComments } from "./get-task-comments";
import { TaskCommentsPresenter } from "./task-comments.universal";

type TaskCommentsContainerProps = {
	taskIdPromise: Promise<string>;
};

export async function TaskCommentsContainer({
	taskIdPromise,
}: TaskCommentsContainerProps) {
	const taskId = await taskIdPromise;

	const [comments, currentStaffId, currentRole] = await Promise.all([
		getTaskComments(taskId),
		getUserStaffId(),
		getUserRole(),
	]);

	return (
		<TaskCommentsPresenter
			comments={comments}
			currentRole={currentRole}
			currentStaffId={currentStaffId}
		/>
	);
}
