import Link from "next/link";
import { getMyProjects } from "./get-my-projects";

export async function MyProjects() {
	const projects = await getMyProjects();

	if (!projects.length) {
		return (
			<p className="text-sm text-muted-foreground">
				担当プロジェクトはありません
			</p>
		);
	}

	return (
		<ul className="space-y-2">
			{projects.map((project) => (
				<li
					className="flex items-center justify-between text-sm"
					key={project.projectId}
				>
					<Link
						className="text-primary underline"
						href={`/projects/${project.projectId}`}
					>
						{project.name}
					</Link>
					<span className="text-muted-foreground">
						{project.dueDate ?? "-"}
					</span>
				</li>
			))}
		</ul>
	);
}
