export const GlossaryTag = {
  ByProjectId: (projectId: string): string =>
    `GLOSSARY_TAG_PROJECT_${projectId}`,
  Common: "GLOSSARY_TAG_COMMON",
};
