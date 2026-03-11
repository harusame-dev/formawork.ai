import Link from "next/link";
import { TaskStatusBadge } from "@/features/task/status/task-status-badge.universal";
import { getMyTasks } from "./get-my-tasks";

export async function MyTasks() {
	const tasks = await getMyTasks();

	if (!tasks.length) {
		return (
			<p className="text-sm text-muted-foreground">担当タスクはありません</p>
		);
	}

	return (
		<ul className="space-y-2">
			{tasks.map((task) => (
				<li
					className="flex items-center justify-between text-sm"
					key={task.taskId}
				>
					<div className="flex items-center gap-2 min-w-0">
						<TaskStatusBadge status={task.status} />
						<span className="truncate">{task.name}</span>
					</div>
					<Link
						className="text-muted-foreground underline shrink-0 ml-2"
						href={`/projects/${task.projectId}`}
					>
						{task.projectName}
					</Link>
				</li>
			))}
		</ul>
	);
}
