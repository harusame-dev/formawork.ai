import { getProjects } from "./get-projects";
import { ProjectsPresenter } from "./projects.universal";
import type { ProjectsCondition } from "./schema";

export async function ProjectsContainer({
	condition,
}: {
	condition: Promise<ProjectsCondition>;
}) {
	const { projects, page, totalPages } = await getProjects(await condition);

	return (
		<ProjectsPresenter
			page={page}
			projects={projects}
			totalPages={totalPages}
		/>
	);
}
