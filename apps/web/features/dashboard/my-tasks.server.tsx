import Link from "next/link";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { TaskStatusBadge } from "@/features/task/status/task-status-badge.universal";
import { getMyTasks } from "./get-my-tasks";

export async function MyTasks() {
	const [tasks, staffId] = await Promise.all([getMyTasks(), getUserStaffId()]);

	if (!tasks.length) {
		return (
			<p className="text-sm text-muted-foreground">担当タスクはありません</p>
		);
	}

	const grouped = Object.values(
		tasks.reduce<
			Record<string, { projectId: string; projectName: string; tasks: typeof tasks }>
		>((acc, task) => {
			if (!acc[task.projectId]) {
				acc[task.projectId] = {
					projectId: task.projectId,
					projectName: task.projectName,
					tasks: [],
				};
			}
			// biome-ignore lint/style/noNonNullAssertion: initialized above
			acc[task.projectId]!.tasks.push(task);
			return acc;
		}, {}),
	);

	return (
		<div className="space-y-4">
			{grouped.map((group) => (
				<div key={group.projectId} className="space-y-1">
					<Link
						className="text-xs font-medium text-muted-foreground underline"
						href={`/projects/${group.projectId}`}
					>
						{group.projectName}
					</Link>
					<ul className="space-y-1">
						{group.tasks.map((task) => (
							<li
								className="flex items-center gap-2 text-sm"
								key={task.taskId}
							>
								<TaskStatusBadge status={task.status} />
								<span className="truncate">{task.name}</span>
							</li>
						))}
					</ul>
				</div>
			))}
			{staffId && (
				<Link
					className="text-xs text-muted-foreground underline"
					href={`/tasks?assigneeIds=${staffId}&statuses=todo&statuses=in_progress`}
				>
					すべて見る
				</Link>
			)}
		</div>
	);
}
