import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteTaskDialog } from "@/features/task/delete/delete-task-dialog.client";
import { EditTaskFormContainer } from "@/features/task/edit/edit-task-form.server";
import { TaskStatusSelect } from "@/features/task/status/task-status-select.client";
import { AssigneesDisplay } from "@/features/user/assignees-display.universal";
import type { AllTaskListItem } from "./get-all-tasks";

type AllTasksPresenterProps = {
	tasks: AllTaskListItem[];
};

export function AllTasksPresenter({ tasks }: AllTasksPresenterProps) {
	if (!tasks.length) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				タスクがありません
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>プロジェクト名</TableHead>
					<TableHead>タスク名</TableHead>
					<TableHead>ステータス</TableHead>
					<TableHead>担当者</TableHead>
					<TableHead>期限</TableHead>
					<TableHead>操作</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tasks.map((task) => (
					<TableRow key={task.taskId}>
						<TableCell>
							<Link className="underline" href={`/projects/${task.projectId}`}>
								{task.projectName}
							</Link>
						</TableCell>
						<TableCell>
							<Link
								className="underline"
								href={`/projects/${task.projectId}/tasks/${task.taskId}`}
							>
								{task.name}
							</Link>
						</TableCell>
						<TableCell>
							<TaskStatusSelect
								currentStatus={task.status}
								projectId={task.projectId}
								taskId={task.taskId}
							/>
						</TableCell>
						<TableCell>
							<AssigneesDisplay assignees={task.assignees} />
						</TableCell>
						<TableCell>{task.dueDate ?? "-"}</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								<Suspense>
									<EditTaskFormContainer task={task} />
								</Suspense>
								<DeleteTaskDialog
									projectId={task.projectId}
									taskId={task.taskId}
								/>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
