import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { getProjectSummary } from "./get-project-summary";
import { ProjectStatusBar } from "./project-status-bar.universal";

export async function ProjectSummaryCards() {
	const { projectTotal, taskSummary } = await getProjectSummary();

	const totalTasks =
		taskSummary.todo + taskSummary.inProgress + taskSummary.done;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							総案件数
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{projectTotal}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							未着手タスク
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{taskSummary.todo}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							進行中タスク
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{taskSummary.inProgress}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							完了タスク
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{taskSummary.done}</p>
					</CardContent>
				</Card>
			</div>

			{totalTasks > 0 && (
				<ProjectStatusBar
					done={taskSummary.done}
					inProgress={taskSummary.inProgress}
					todo={taskSummary.todo}
					total={totalTasks}
				/>
			)}
		</div>
	);
}
