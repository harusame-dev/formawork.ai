import { getUserOptions } from "@/features/user/list/get-user-options";
import { ProjectForm } from "./project-form.client";

export async function RegisterProjectFormContainer() {
	const assigneeOptions = await getUserOptions();

	return <ProjectForm assigneeOptions={assigneeOptions} mode="register" />;
}
