import { getProjectSummary } from "./get-project-summary";
import { ProjectStatusBar } from "./project-status-bar.universal";

export async function ProjectSummaryCards() {
	const { taskSummary } = await getProjectSummary();

	const totalTasks =
		taskSummary.todo + taskSummary.inProgress + taskSummary.done;

	if (totalTasks === 0) {
		return null;
	}

	return (
		<ProjectStatusBar
			done={taskSummary.done}
			inProgress={taskSummary.inProgress}
			todo={taskSummary.todo}
			total={totalTasks}
		/>
	);
}
