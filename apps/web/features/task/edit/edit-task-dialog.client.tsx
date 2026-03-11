"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { useState } from "react";
import type { TaskListItem } from "@/features/task/list/get-tasks";
import { TaskForm } from "@/features/task/register/task-form.client";
import type { UserOption } from "@/features/user/list/get-user-options";

type EditTaskDialogProps = {
	assigneeOptions: UserOption[];
	task: TaskListItem;
};

export function EditTaskDialog({ assigneeOptions, task }: EditTaskDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button" variant="outline">
					編集
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>タスクを編集</DialogTitle>
				</DialogHeader>
				<TaskForm
					assigneeOptions={assigneeOptions}
					initialValues={{
						assigneeId: task.assigneeId ?? "",
						description: task.description,
						dueDate: task.dueDate,
						name: task.name,
						status: task.status,
					}}
					mode="edit"
					onSuccess={() => setOpen(false)}
					projectId={task.projectId}
					taskId={task.taskId}
				/>
			</DialogContent>
		</Dialog>
	);
}
