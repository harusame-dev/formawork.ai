import { AllTasksPresenter } from "./all-tasks.universal";
import { getAllTasks } from "./get-all-tasks";
import type { TasksCondition } from "./schema";

type AllTasksContainerProps = {
	conditionPromise: Promise<TasksCondition>;
};

export async function AllTasksContainer({
	conditionPromise,
}: AllTasksContainerProps) {
	const condition = await conditionPromise;
	const tasks = await getAllTasks(condition);
	return <AllTasksPresenter tasks={tasks} />;
}
