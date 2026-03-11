import { notFound } from "next/navigation";
import { getProjectDetail } from "@/features/project/detail/get-project-detail";
import { ProjectForm } from "@/features/project/register/project-form.client";
import { getUserOptions } from "@/features/user/list/get-user-options";

type ProjectEditFormContainerProps = {
	projectIdPromise: Promise<string>;
};

export async function ProjectEditFormContainer({
	projectIdPromise,
}: ProjectEditFormContainerProps) {
	const projectId = await projectIdPromise;
	const [project, assigneeOptions] = await Promise.all([
		getProjectDetail(projectId),
		getUserOptions(),
	]);

	if (!project) {
		notFound();
	}

	return (
		<ProjectForm
			assigneeOptions={assigneeOptions}
			initialValues={{
				assigneeId: project.assigneeId ?? "",
				description: project.description,
				dueDate: project.dueDate,
				name: project.name,
			}}
			mode="edit"
			projectId={projectId}
		/>
	);
}
