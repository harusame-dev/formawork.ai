import { getTasks } from "./get-tasks";
import { TasksPresenter } from "./tasks.universal";

export async function TasksContainer({ projectId }: { projectId: string }) {
	const tasks = await getTasks(projectId);

	return <TasksPresenter tasks={tasks} />;
}
