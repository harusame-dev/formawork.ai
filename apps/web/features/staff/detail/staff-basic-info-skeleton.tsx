import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffBasicInfoSkeleton() {
	return (
		<div className="space-y-4">
			<div>
				<Skeleton className="text-sm text-muted-foreground h-4 mt-1 w-28" />
				<Skeleton className="font-bold h-5 mt-1 w-48" />
			</div>
			<div>
				<Skeleton className="text-sm text-muted-foreground h-4 mt-1 w-12" />
				<Skeleton className="font-bold h-5 mt-1 w-40" />
			</div>
			<div>
				<Skeleton className="text-sm text-muted-foreground h-4 mt-1 w-12" />
				<Skeleton className="font-bold h-5 mt-1 w-40" />
			</div>
			<div>
				<Skeleton className="text-sm text-muted-foreground h-4 mt-1 w-12" />
				<Skeleton className="font-bold h-5 mt-1 w-40" />
			</div>
		</div>
	);
}
