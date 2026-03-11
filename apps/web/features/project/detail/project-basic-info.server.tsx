import { notFound } from "next/navigation";
import { getProjectDetail } from "./get-project-detail";
import { ProjectBasicInfoPresenter } from "./project-basic-info.universal";

type ProjectBasicInfoContainerProps = {
	projectIdPromise: Promise<string>;
};

export async function ProjectBasicInfoContainer({
	projectIdPromise,
}: ProjectBasicInfoContainerProps) {
	const projectId = await projectIdPromise;
	const project = await getProjectDetail(projectId);

	if (!project) {
		notFound();
	}

	return <ProjectBasicInfoPresenter project={project} />;
}
