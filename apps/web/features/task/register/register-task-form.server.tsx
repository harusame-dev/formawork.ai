import { getUserOptions } from "@/features/user/list/get-user-options";
import { RegisterTaskDialog } from "./register-task-dialog.client";

type RegisterTaskFormContainerProps = {
	projectId: string;
};

export async function RegisterTaskFormContainer({
	projectId,
}: RegisterTaskFormContainerProps) {
	const assigneeOptions = await getUserOptions();

	return (
		<RegisterTaskDialog
			assigneeOptions={assigneeOptions}
			projectId={projectId}
		/>
	);
}
