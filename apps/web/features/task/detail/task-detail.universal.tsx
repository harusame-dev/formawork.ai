import Link from "next/link";
import { TaskStatusSelect } from "@/features/task/status/task-status-select.client";
import { AssigneesDisplay } from "@/features/user/assignees-display.universal";
import type { TaskDetail } from "./get-task-detail";

type TaskDetailPresenterProps = {
	task: TaskDetail;
};

export function TaskDetailPresenter({ task }: TaskDetailPresenterProps) {
	return (
		<div className="space-y-6">
			<table className="w-full">
				<tbody>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							プロジェクト
						</th>
						<td className="font-bold py-1">
							<Link className="underline" href={`/projects/${task.projectId}`}>
								{task.projectName}
							</Link>
						</td>
					</tr>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							ステータス
						</th>
						<td className="py-1">
							<TaskStatusSelect
								currentStatus={task.status}
								projectId={task.projectId}
								taskId={task.taskId}
							/>
						</td>
					</tr>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							担当者
						</th>
						<td className="font-bold py-1">
							<AssigneesDisplay assignees={task.assignees} showAll />
						</td>
					</tr>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							期限
						</th>
						<td className="font-bold py-1">{task.dueDate ?? "-"}</td>
					</tr>
				</tbody>
			</table>

			<div>
				<p className="text-sm font-normal text-muted-foreground mb-1">
					詳細説明
				</p>
				<p className="whitespace-pre-wrap">{task.description ?? "説明なし"}</p>
			</div>
		</div>
	);
}
