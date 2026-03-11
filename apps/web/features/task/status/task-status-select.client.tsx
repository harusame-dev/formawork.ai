"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { useTransition } from "react";
import { TaskStatus, TaskStatusLabel, type TaskStatusValue } from "../status";
import { updateTaskStatusAction } from "./update-task-status.action";

type TaskStatusSelectProps = {
	currentStatus: string;
	projectId: string;
	taskId: string;
};

export function TaskStatusSelect({
	currentStatus,
	projectId,
	taskId,
}: TaskStatusSelectProps) {
	const [isPending, startTransition] = useTransition();

	function handleChange(value: string) {
		startTransition(async () => {
			await updateTaskStatusAction({
				projectId,
				status: value as TaskStatusValue,
				taskId,
			});
		});
	}

	return (
		<Select
			defaultValue={currentStatus}
			disabled={isPending}
			onValueChange={handleChange}
		>
			<SelectTrigger className="w-32" size="sm">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{Object.entries(TaskStatus).map(([, value]) => (
					<SelectItem key={value} value={value}>
						{TaskStatusLabel[value]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
