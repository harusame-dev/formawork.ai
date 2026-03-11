export const TaskStatus = {
	Done: "done",
	InProgress: "in_progress",
	Todo: "todo",
} as const;

export type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskStatusLabel: Record<TaskStatusValue, string> = {
	done: "完了",
	in_progress: "進行中",
	todo: "未着手",
};
