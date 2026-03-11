import { Skeleton } from "@workspace/ui/components/skeleton";

export function ProjectSearchFormSkeleton() {
	return (
		<div aria-busy className="flex flex-wrap gap-4 items-end">
			<span className="sr-only">読み込み中</span>
			<div className="space-y-2">
				<Skeleton className="h-5 w-16" />
				<Skeleton className="h-9 w-48" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-5 w-16" />
				<Skeleton className="h-9 w-40" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-20" />
				<Skeleton className="h-9 w-24" />
			</div>
		</div>
	);
}
