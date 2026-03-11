import { Skeleton } from "@workspace/ui/components/skeleton";

export function UserBasicInfoSkeleton() {
	return (
		<table className="w-full">
			<tbody className="space-y-4 [&>tr]:block">
				<tr>
					<th className="h-lh flex items-end">
						<Skeleton className="h-4 w-28" />
					</th>
					<td className="h-lh flex items-end">
						<Skeleton className="h-4 w-48" />
					</td>
				</tr>
				<tr>
					<th className="h-lh flex items-end">
						<Skeleton className="h-4 w-12" />
					</th>
					<td className="h-lh flex items-end">
						<Skeleton className="h-4 w-40" />
					</td>
				</tr>
				<tr>
					<th className="h-lh flex items-end">
						<Skeleton className="h-4 w-12" />
					</th>
					<td className="h-lh flex items-end">
						<Skeleton className="h-4 w-40" />
					</td>
				</tr>
				<tr>
					<th className="h-lh flex items-end">
						<Skeleton className="h-4 w-12" />
					</th>
					<td className="h-lh flex items-end">
						<Skeleton className="h-4 w-40" />
					</td>
				</tr>
			</tbody>
		</table>
	);
}
