import Link from "next/link";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getMyProjects } from "./get-my-projects";

export async function MyProjects() {
	const [projects, staffId] = await Promise.all([
		getMyProjects(),
		getUserStaffId(),
	]);

	if (!projects.length) {
		return (
			<p className="text-sm text-muted-foreground">担当案件はありません</p>
		);
	}

	return (
		<div className="space-y-2">
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
			{staffId && (
				<Link
					className="text-xs text-muted-foreground underline"
					href={`/projects?assigneeId=${staffId}`}
				>
					すべて見る
				</Link>
			)}
		</div>
	);
}
