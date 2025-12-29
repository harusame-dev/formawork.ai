import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffEditFormSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-2">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-10 w-full max-w-xs" />
			</div>

			<div className="space-y-2">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-10 w-full max-w-xs" />
			</div>

			<div className="space-y-2">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-10 w-full max-w-sm" />
			</div>

			<div className="space-y-2">
				<Skeleton className="h-4 w-16" />
				<div className="flex gap-6">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-5 w-24" />
				</div>
			</div>

			<div className="flex gap-2 pt-2">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-10 w-32" />
			</div>
		</div>
	);
}
