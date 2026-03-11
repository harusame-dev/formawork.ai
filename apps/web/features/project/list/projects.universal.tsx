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
					案件が見つかりませんでした
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>案件名</TableHead>
						<TableHead>担当者</TableHead>
						<TableHead>期限</TableHead>
						<TableHead>登録日</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects.map((project) => (
						<TableRow key={project.projectId}>
							<TableCell>
								<Link
									className="text-primary underline"
									href={`/projects/${project.projectId}`}
								>
									{project.name}
								</Link>
							</TableCell>
							<TableCell>{project.assigneeName ?? "-"}</TableCell>
							<TableCell>{project.dueDate ?? "-"}</TableCell>
							<TableCell>
								{project.createdAt.toLocaleDateString("ja-JP")}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<SearchPagination currentPage={page} totalPages={totalPages} />
		</div>
	);
}
