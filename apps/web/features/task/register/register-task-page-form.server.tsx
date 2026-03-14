import { getProjectOptions } from "@/features/task/list/get-project-options";
import { getUserOptions } from "@/features/user/list/get-user-options";
import { RegisterTaskPageForm } from "./register-task-page-form.client";

type Props = {
	projectIdPromise?: Promise<string | undefined>;
};

export async function RegisterTaskPageFormContainer({
	projectIdPromise,
}: Props = {}) {
	const [assigneeOptions, projectOptions, projectId] = await Promise.all([
		getUserOptions(),
		getProjectOptions(),
		projectIdPromise,
	]);

	return (
		<RegisterTaskPageForm
			assigneeOptions={assigneeOptions}
			projectId={projectId}
			projectOptions={projectOptions}
		/>
	);
}
