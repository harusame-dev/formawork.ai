import { getUserOptions } from "@/features/user/list/get-user-options";
import { ProjectSearchForm } from "./project-search-form.client";
import type { ProjectsCondition } from "./schema";

type ProjectSearchFormContainerProps = {
	conditionPromise: Promise<ProjectsCondition>;
};

export async function ProjectSearchFormContainer({
	conditionPromise,
}: ProjectSearchFormContainerProps) {
	const [condition, assigneeOptions] = await Promise.all([
		conditionPromise,
		getUserOptions(),
	]);

	return (
		<ProjectSearchForm
			assigneeOptions={assigneeOptions}
			condition={condition}
		/>
	);
}
