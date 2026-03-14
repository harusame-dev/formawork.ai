import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import { AssigneesDisplay } from "@/features/user/assignees-display.universal";
import type { ProjectsListItem } from "./schema";

type ProjectsPresenterProps = {
	page: number;
	projects: ProjectsListItem[];
	totalPages: number;
};

export function ProjectsPresenter({
	page,
	projects,
	totalPages,
}: ProjectsPresenterProps) {
	if (!projects.length) {
		return (
			<div className="space-y-4">
				<div className="text-center py-8 text-muted-foreground">
					プロジェクトが見つかりませんでした
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>プロジェクト名</TableHead>
						<TableHead>担当者</TableHead>
						<TableHead>期限</TableHead>
						<TableHead>登録日</TableHead>
						<TableHead>進捗</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects.map((project) => (
						<TableRow
							className={project.archivedAt ? "opacity-60" : undefined}
							key={project.projectId}
						>
							<TableCell>
								<Link
									className="text-primary underline"
									href={`/projects/${project.projectId}`}
								>
									{project.name}
								</Link>
							</TableCell>
							<TableCell>
								<AssigneesDisplay assignees={project.assignees} />
							</TableCell>
							<TableCell>{project.dueDate ?? "-"}</TableCell>
							<TableCell>
								{project.createdAt.toLocaleDateString("ja-JP")}
							</TableCell>
							<TableCell>
								<span className="text-base font-semibold">
									{project.totalTasks === 0
										? 0
										: Math.round(
												(project.doneTasks / project.totalTasks) * 100,
											)}
									%
								</span>
								<span className="text-sm text-muted-foreground ml-1">
									({project.doneTasks} / {project.totalTasks})
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<SearchPagination currentPage={page} totalPages={totalPages} />
		</div>
	);
}
