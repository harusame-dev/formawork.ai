import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffBasicInfoSkeleton() {
	return (
		<table className="w-full">
			<tbody className="space-y-4 [&>tr]:block">
				<tr>
					<th className="block text-left text-sm font-normal text-muted-foreground">
						<Skeleton className="h-[1lh] w-28" />
					</th>
					<td className="block font-bold">
						<Skeleton className="h-[1lh] w-48" />
					</td>
				</tr>
				<tr>
					<th className="block text-left text-sm font-normal text-muted-foreground">
						<Skeleton className="h-[1lh] w-12" />
					</th>
					<td className="block font-bold">
						<Skeleton className="h-[1lh] w-40" />
					</td>
				</tr>
				<tr>
					<th className="block text-left text-sm font-normal text-muted-foreground">
						<Skeleton className="h-[1lh] w-12" />
					</th>
					<td className="block font-bold">
						<Skeleton className="h-[1lh] w-40" />
					</td>
				</tr>
				<tr>
					<th className="block text-left text-sm font-normal text-muted-foreground">
						<Skeleton className="h-[1lh] w-12" />
					</th>
					<td className="block font-bold">
						<Skeleton className="h-[1lh] w-40" />
					</td>
				</tr>
			</tbody>
		</table>
	);
}
