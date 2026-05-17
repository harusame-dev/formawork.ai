import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";

export function OrganizationsSkeleton() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[30%]">カテゴリー</TableHead>
					<TableHead>組織名</TableHead>
					<TableHead className="w-px whitespace-nowrap text-right">
						操作
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{[1, 2, 3, 4, 5, 6].map((id) => (
					<TableRow key={id}>
						<TableCell>
							<Skeleton className="h-4 w-32" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-40" />
						</TableCell>
						<TableCell>
							<div className="flex justify-end gap-2">
								<Skeleton className="h-8 w-20" />
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
