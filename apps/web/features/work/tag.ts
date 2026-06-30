export const WorkTag = {
  Detail: (workId: string): string => `WORK_TAG_DETAIL_${workId}`,
  ListByProjectId: (projectId: string): string => `WORK_TAG_LIST_${projectId}`,
  SegmentsByWorkId: (workId: string): string => `WORK_TAG_SEGMENTS_${workId}`,
};
