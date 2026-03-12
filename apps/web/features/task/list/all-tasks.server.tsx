import { AllTasksPresenter } from "./all-tasks.universal";
import { getAllTasks } from "./get-all-tasks";

export async function AllTasksContainer() {
	const tasks = await getAllTasks();
	return <AllTasksPresenter tasks={tasks} />;
}
