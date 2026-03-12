import { TaskStatusSelect } from "@/features/task/status/task-status-select.client";
import type { TaskDetail } from "./get-task-detail";

type TaskDetailPresenterProps = {
	task: TaskDetail;
};

export function TaskDetailPresenter({ task }: TaskDetailPresenterProps) {
	return (
		<div className="space-y-6">
			<table className="w-full">
				<tbody className="space-y-4 [&>tr]:block">
					<tr>
						<th
							className="block text-left text-sm font-normal text-muted-foreground"
							scope="row"
						>
							ステータス
						</th>
						<td className="block font-bold">
							<TaskStatusSelect
								currentStatus={task.status}
								projectId={task.projectId}
								taskId={task.taskId}
							/>
						</td>
					</tr>
					<tr>
						<th
							className="block text-left text-sm font-normal text-muted-foreground"
							scope="row"
						>
							担当者
						</th>
						<td className="block font-bold">{task.assigneeName ?? "-"}</td>
					</tr>
					<tr>
						<th
							className="block text-left text-sm font-normal text-muted-foreground"
							scope="row"
						>
							期限
						</th>
						<td className="block font-bold">{task.dueDate ?? "-"}</td>
					</tr>
				</tbody>
			</table>

			<div>
				<p className="text-sm font-normal text-muted-foreground mb-1">
					詳細説明
				</p>
				<p className="whitespace-pre-wrap">{task.description ?? "説明なし"}</p>
			</div>

			<div>
				<p className="text-sm font-normal text-muted-foreground mb-1">
					コメント
				</p>
				<p className="text-muted-foreground">コメント機能は準備中です</p>
			</div>
		</div>
	);
}
