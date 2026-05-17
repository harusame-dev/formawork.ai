import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function ChatHistorySkeleton() {
	return (
		<Card className="p-4 flex flex-col gap-3">
			{[1, 2, 3, 4, 5].map((id) => (
				<Skeleton className="h-6 w-full" key={id} />
			))}
		</Card>
	);
}
