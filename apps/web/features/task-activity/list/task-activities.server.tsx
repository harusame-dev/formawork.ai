import { getUserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getTaskActivities } from "./get-task-activities";
import { TaskActivitiesPresenter } from "./task-activities.universal";

type TaskActivitiesContainerProps = {
	taskIdPromise: Promise<string>;
};

export async function TaskActivitiesContainer({
	taskIdPromise,
}: TaskActivitiesContainerProps) {
	const taskId = await taskIdPromise;

	const [activities, currentStaffId, currentRole] = await Promise.all([
		getTaskActivities(taskId),
		getUserStaffId(),
		getUserRole(),
	]);

	return (
		<TaskActivitiesPresenter
			activities={activities}
			currentRole={currentRole}
			currentStaffId={currentStaffId}
		/>
	);
}
