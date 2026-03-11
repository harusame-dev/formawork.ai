import { Badge } from "@workspace/ui/components/badge";
import { TaskStatusLabel, type TaskStatusValue } from "../status";

type TaskStatusBadgeProps = {
	status: string;
};

const statusVariant: Record<
	TaskStatusValue,
	"default" | "secondary" | "outline"
> = {
	done: "default",
	in_progress: "secondary",
	todo: "outline",
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
	const label =
		status in TaskStatusLabel
			? TaskStatusLabel[status as TaskStatusValue]
			: status;

	const variant =
		status in statusVariant
			? statusVariant[status as TaskStatusValue]
			: "outline";

	return <Badge variant={variant}>{label}</Badge>;
}
