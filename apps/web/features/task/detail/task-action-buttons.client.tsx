"use client";

import { useRouter } from "next/navigation";
import { DeleteTaskDialog } from "@/features/task/delete/delete-task-dialog.client";

type TaskActionButtonsProps = {
	projectId: string;
	taskId: string;
};

export function TaskActionButtons({
	projectId,
	taskId,
}: TaskActionButtonsProps) {
	const router = useRouter();

	return (
		<DeleteTaskDialog
			onSuccess={() => router.push(`/projects/${projectId}`)}
			projectId={projectId}
			taskId={taskId}
		/>
	);
}
