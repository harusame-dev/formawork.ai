export const TranslationMemoryTag = {
  All: "TM_TAG_ALL",
  ByProjectId: (projectId: string): string => `TM_TAG_PROJECT_${projectId}`,
};
