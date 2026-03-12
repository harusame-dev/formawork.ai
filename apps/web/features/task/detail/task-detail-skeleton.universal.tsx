import { Skeleton } from "@workspace/ui/components/skeleton";

export function TaskDetailSkeleton() {
	return (
		<div className="space-y-6">
			<table className="w-full">
				<tbody className="space-y-4 [&>tr]:block">
					{Array.from({ length: 3 }).map((_, index) => (
						<tr key={index}>
							<th className="h-lh flex items-end">
								<Skeleton className="h-4 w-20" />
							</th>
							<td className="h-lh flex items-end">
								<Skeleton className="h-4 w-40" />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
