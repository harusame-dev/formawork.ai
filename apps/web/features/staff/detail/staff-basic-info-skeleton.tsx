import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffBasicInfoSkeleton() {
	return (
		<table className="w-full">
			<tbody className="space-y-4 [&>tr]:block">
				<tr>
					<th className="block text-left">
						<Skeleton className="h-4 mt-1 w-28" />
					</th>
					<td className="block">
						<Skeleton className="h-5 mt-1 w-48" />
					</td>
				</tr>
				<tr>
					<th className="block text-left">
						<Skeleton className="h-4 mt-1 w-12" />
					</th>
					<td className="block">
						<Skeleton className="h-5 mt-1 w-40" />
					</td>
				</tr>
				<tr>
					<th className="block text-left">
						<Skeleton className="h-4 mt-1 w-12" />
					</th>
					<td className="block">
						<Skeleton className="h-5 mt-1 w-40" />
					</td>
				</tr>
				<tr>
					<th className="block text-left">
						<Skeleton className="h-4 mt-1 w-12" />
					</th>
					<td className="block">
						<Skeleton className="h-5 mt-1 w-40" />
					</td>
				</tr>
			</tbody>
		</table>
	);
}
