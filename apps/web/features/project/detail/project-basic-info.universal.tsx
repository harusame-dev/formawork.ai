import type { ReactNode } from "react";
import { DateTime } from "@/components/date-time.client";

type ProjectBasicInfoPresenterProps = {
	project: {
		assigneeName: string | null;
		createdAt: Date;
		description: string | null;
		dueDate: string | null;
		projectId: string;
		updatedAt: Date;
	};
};

type ProjectField = {
	label: string;
	value: ReactNode;
};

export function ProjectBasicInfoPresenter({
	project,
}: ProjectBasicInfoPresenterProps) {
	const fields: ProjectField[] = [
		{
			label: "担当者",
			value: project.assigneeName ?? "-",
		},
		{
			label: "期限",
			value: project.dueDate ?? "-",
		},
		{
			label: "詳細説明",
			value: project.description ?? "-",
		},
		{
			label: "登録日",
			value: <DateTime date={project.createdAt} />,
		},
		{
			label: "更新日",
			value: <DateTime date={project.updatedAt} />,
		},
	];

	return (
		<table className="w-full">
			<tbody className="space-y-4 [&>tr]:block">
				{fields.map((field) => (
					<tr key={field.label}>
						<th
							className="block text-left text-sm font-normal text-muted-foreground"
							scope="row"
						>
							{field.label}
						</th>
						<td className="block font-bold">{field.value}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
