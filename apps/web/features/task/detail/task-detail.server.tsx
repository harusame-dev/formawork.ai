import { notFound } from "next/navigation";
import { getTaskDetail } from "./get-task-detail";
import { TaskDetailPresenter } from "./task-detail.universal";

type TaskDetailContainerProps = {
	taskIdPromise: Promise<string>;
};

export async function TaskDetailContainer({
	taskIdPromise,
}: TaskDetailContainerProps) {
	const taskId = await taskIdPromise;
	const task = await getTaskDetail(taskId);

	if (!task) {
		notFound();
	}

	return <TaskDetailPresenter task={task} />;
}
