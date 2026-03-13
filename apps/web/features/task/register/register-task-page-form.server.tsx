import { getProjectOptions } from "@/features/task/list/get-project-options";
import { getUserOptions } from "@/features/user/list/get-user-options";
import { RegisterTaskPageForm } from "./register-task-page-form.client";

export async function RegisterTaskPageFormContainer() {
	const [assigneeOptions, projectOptions] = await Promise.all([
		getUserOptions(),
		getProjectOptions(),
	]);

	return (
		<RegisterTaskPageForm
			assigneeOptions={assigneeOptions}
			projectOptions={projectOptions}
		/>
	);
}
