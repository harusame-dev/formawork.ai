import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Suspense } from "react";
import { MyProjectsCardTitle } from "@/features/dashboard/my-projects-card-title.server";
import { MyProjects } from "@/features/dashboard/my-projects.server";
import { MyTasksCardTitle } from "@/features/dashboard/my-tasks-card-title.server";
import { MyTasks } from "@/features/dashboard/my-tasks.server";
import { ProjectSummaryCards } from "@/features/dashboard/project-summary-cards.server";

export default function Page() {
	return (
		<div className="container mx-auto p-4 space-y-4">
			<Suspense fallback={<div className="sr-only">読み込み中</div>}>
				<ProjectSummaryCards />
			</Suspense>

			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							<Suspense fallback="担当プロジェクト">
								<MyProjectsCardTitle />
							</Suspense>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Suspense
							fallback={
								<p className="text-sm text-muted-foreground">読み込み中...</p>
							}
						>
							<MyProjects />
						</Suspense>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							<Suspense fallback="担当タスク">
								<MyTasksCardTitle />
							</Suspense>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Suspense
							fallback={
								<p className="text-sm text-muted-foreground">読み込み中...</p>
							}
						>
							<MyTasks />
						</Suspense>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
