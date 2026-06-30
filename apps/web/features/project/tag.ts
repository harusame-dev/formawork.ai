export const ProjectTag = {
  Detail: (projectId: string): string => `PROJECT_TAG_DETAIL_${projectId}`,
  List: "PROJECT_TAG_LIST",
  MembersByProjectId: (projectId: string): string =>
    `PROJECT_TAG_MEMBERS_${projectId}`,
};
