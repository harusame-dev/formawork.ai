import { notFound } from "next/navigation";
import { getProjectDetail } from "./get-project-detail";
import { ProjectInfoPresenter } from "./project-info.universal";

type ProjectInfoContainerProps = {
	projectIdPromise: Promise<string>;
};

export async function ProjectInfoContainer({
	projectIdPromise,
}: ProjectInfoContainerProps) {
	const project = await getProjectDetail(await projectIdPromise);

	if (!project) {
		notFound();
	}

	return <ProjectInfoPresenter name={project.name} />;
}
