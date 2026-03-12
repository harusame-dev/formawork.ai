import { notFound } from "next/navigation";
import { getTaskDetail } from "./get-task-detail";
import { TaskInfoPresenter } from "./task-info.universal";

type TaskInfoContainerProps = {
	taskIdPromise: Promise<string>;
};

export async function TaskInfoContainer({
	taskIdPromise,
}: TaskInfoContainerProps) {
	const taskId = await taskIdPromise;
	const task = await getTaskDetail(taskId);

	if (!task) {
		notFound();
	}

	return <TaskInfoPresenter name={task.name} />;
}
