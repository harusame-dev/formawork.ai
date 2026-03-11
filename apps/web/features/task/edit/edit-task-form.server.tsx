import type { TaskListItem } from "@/features/task/list/get-tasks";
import { getUserOptions } from "@/features/user/list/get-user-options";
import { EditTaskDialog } from "./edit-task-dialog.client";

type EditTaskFormContainerProps = {
	task: TaskListItem;
};

export async function EditTaskFormContainer({
	task,
}: EditTaskFormContainerProps) {
	const assigneeOptions = await getUserOptions();

	return <EditTaskDialog assigneeOptions={assigneeOptions} task={task} />;
}
