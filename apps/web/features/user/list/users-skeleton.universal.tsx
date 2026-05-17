import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function UsersSkeleton() {
	return (
		<Card className="p-4 flex flex-col gap-3">
			{[1, 2, 3, 4, 5].map((id) => (
				<div className="flex gap-4" key={id}>
					<Skeleton className="h-5 flex-1" />
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-5 w-24" />
				</div>
			))}
		</Card>
	);
}
