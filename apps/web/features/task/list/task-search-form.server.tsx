import { getUserOptions } from "@/features/user/list/get-user-options";
import { getProjectOptions } from "./get-project-options";
import type { TasksCondition } from "./schema";
import { TaskSearchForm } from "./task-search-form.client";

type TaskSearchFormContainerProps = {
	conditionPromise: Promise<TasksCondition>;
};

export async function TaskSearchFormContainer({
	conditionPromise,
}: TaskSearchFormContainerProps) {
	const [condition, projectOptions, assigneeOptions] = await Promise.all([
		conditionPromise,
		getProjectOptions({ includeArchived: false }),
		getUserOptions(),
	]);

	return (
		<TaskSearchForm
			assigneeOptions={assigneeOptions}
			condition={condition}
			projectOptions={projectOptions}
		/>
	);
}
