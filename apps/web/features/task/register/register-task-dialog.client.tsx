"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { UserOption } from "@/features/user/list/get-user-options";
import { TaskForm } from "./task-form.client";

type RegisterTaskDialogProps = {
	assigneeOptions: UserOption[];
	projectId: string;
};

export function RegisterTaskDialog({
	assigneeOptions,
	projectId,
}: RegisterTaskDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button">
					<Plus className="h-4 w-4 mr-1" />
					タスクを追加
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>タスクを追加</DialogTitle>
				</DialogHeader>
				<TaskForm
					assigneeOptions={assigneeOptions}
					mode="register"
					onSuccess={() => setOpen(false)}
					projectId={projectId}
				/>
			</DialogContent>
		</Dialog>
	);
}
