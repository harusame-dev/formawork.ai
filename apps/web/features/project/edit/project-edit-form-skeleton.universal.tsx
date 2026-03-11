import { Skeleton } from "@workspace/ui/components/skeleton";

export function ProjectEditFormSkeleton() {
	return (
		<div aria-busy className="flex flex-col gap-6">
			<span className="sr-only">読み込み中</span>
			<div className="space-y-2">
				<Skeleton className="h-5 w-16" />
				<Skeleton className="h-9 max-w-sm w-full" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-5 w-16" />
				<Skeleton className="h-9 max-w-xs w-full" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-5 w-12" />
				<Skeleton className="h-9 max-w-xs w-full" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-5 w-20" />
				<Skeleton className="h-24 max-w-lg w-full" />
			</div>
		</div>
	);
}
