import type React from "react";
import { getWorks } from "./get-works";
import { WorksPresenter } from "./works.universal";

export async function WorksContainer({
  projectId,
}: {
  projectId: string;
}): Promise<React.JSX.Element> {
  const works = await getWorks(projectId);

  return <WorksPresenter projectId={projectId} works={works} />;
}
