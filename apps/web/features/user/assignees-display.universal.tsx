type Assignee = {
	id: string;
	name: string;
};

type AssigneesDisplayProps = {
	assignees: Assignee[];
	showAll?: boolean;
};

export function AssigneesDisplay({
	assignees,
	showAll = false,
}: AssigneesDisplayProps) {
	if (assignees.length === 0) {
		return <span>-</span>;
	}

	if (showAll) {
		return <span>{assignees.map((a) => a.name).join("、")}</span>;
	}

	const displayed = assignees.slice(0, 2);

	return (
		<div className="max-w-[10rem] min-w-0">
			<span className="block truncate">
				{displayed.map((a) => a.name).join("、")}
			</span>
		</div>
	);
}
