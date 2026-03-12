export const TaskTag = {
	All: "TASK_TAG_ALL",
	Detail: (taskId: string) => `TASK_TAG_DETAIL_${taskId}`,
	List: (projectId: string) => `TASK_TAG_LIST_${projectId}`,
};
