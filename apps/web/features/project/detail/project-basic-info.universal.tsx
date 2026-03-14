import { AssigneesDisplay } from "@/features/user/assignees-display.universal";

type ProjectBasicInfoPresenterProps = {
	project: {
		archivedAt: Date | null;
		assignees: { id: string; name: string }[];
		description: string | null;
		doneTasks: number;
		dueDate: string | null;
		projectId: string;
		totalTasks: number;
	};
};

export function ProjectBasicInfoPresenter({
	project,
}: ProjectBasicInfoPresenterProps) {
	return (
		<div className="space-y-6">
			<table className="w-full">
				<tbody>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							担当者
						</th>
						<td className="font-bold py-1">
							<AssigneesDisplay assignees={project.assignees} showAll />
						</td>
					</tr>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							期限
						</th>
						<td className="font-bold py-1">{project.dueDate ?? "-"}</td>
					</tr>
					<tr>
						<th
							className="text-left text-sm font-normal text-muted-foreground py-1 pr-4 w-24 whitespace-nowrap"
							scope="row"
						>
							進捗
						</th>
						<td className="font-bold py-1">
							<span className="text-base font-semibold">
								{project.totalTasks === 0
									? 0
									: Math.round((project.doneTasks / project.totalTasks) * 100)}
								%
							</span>
							<span className="text-sm text-muted-foreground ml-1">
								({project.doneTasks} / {project.totalTasks})
							</span>
						</td>
					</tr>
				</tbody>
			</table>

			<div>
				<p className="text-sm font-normal text-muted-foreground mb-1">
					詳細説明
				</p>
				<p className="whitespace-pre-wrap">{project.description ?? "-"}</p>
			</div>
		</div>
	);
}
