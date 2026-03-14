import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Archive } from "lucide-react";

export function ProjectArchiveBadge() {
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Archive
						aria-hidden
						className="h-5 w-5 text-muted-foreground shrink-0"
					/>
				</TooltipTrigger>
				<TooltipContent>アーカイブ済み</TooltipContent>
			</Tooltip>
			<span className="sr-only">（アーカイブ済み）</span>
		</>
	);
}
