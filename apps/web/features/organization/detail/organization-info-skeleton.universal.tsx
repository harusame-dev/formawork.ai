import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function OrganizationInfoSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-48" />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-4 w-56" />
				<div className="flex flex-col gap-1">
					<Skeleton className="h-3 w-32" />
					<div className="flex gap-2">
						<Skeleton className="h-9 flex-1" />
						<Skeleton className="size-9" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
