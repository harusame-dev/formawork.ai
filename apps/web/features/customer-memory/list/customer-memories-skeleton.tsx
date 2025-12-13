import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CustomerMemoriesSkeleton() {
	return (
		<Card>
			<CardContent className="pt-6">
				<table aria-label="顧客メモリ一覧 読み込み中" className="w-full">
					<caption className="sr-only">
						顧客のメモリ情報を読み込み中です
					</caption>
					<thead className="hidden sm:table-header-group">
						<tr className="border-b text-sm font-medium text-muted-foreground">
							<th className="w-12 py-2 px-2 text-left" scope="col">
								#
							</th>
							<th className="py-2 px-2 text-left" scope="col">
								カテゴリ
							</th>
							<th className="py-2 px-2 text-left" scope="col">
								内容
							</th>
							<th className="w-16 py-2 px-2 text-center" scope="col">
								重要度
							</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 15 }).map((_, index) => (
							<tr
								className="border-b last:border-b-0 flex flex-wrap sm:table-row py-2 sm:py-0 min-h-14 sm:min-h-0"
								key={index}
							>
								<td className="text-sm text-muted-foreground sm:table-cell sm:w-12 sm:py-2 sm:px-2">
									<span aria-hidden="true" className="sm:hidden">
										#
									</span>
									{index + 1}
								</td>
								<td className="text-sm sm:table-cell sm:py-2 sm:px-2 ml-2 sm:ml-0">
									<Skeleton className="h-3.5 w-28 inline-block align-middle" />
								</td>
								<td
									aria-label="重要度: 読み込み中"
									className="text-sm text-muted-foreground sm:hidden ml-auto"
								>
									重要度:
									<Skeleton className="h-3.5 w-3 ml-1 inline-block align-middle" />
								</td>
								<td className="text-sm w-full sm:w-auto sm:table-cell sm:py-2 sm:px-2 pl-6 sm:pl-2 mt-1 sm:mt-0 text-muted-foreground sm:text-foreground">
									<Skeleton className="mt-1 h-4 w-full" />
								</td>
								<td className="text-sm text-center hidden sm:table-cell sm:w-16 sm:py-2 sm:px-2">
									<Skeleton className="mt-1 h-4 w-6 mx-auto" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</CardContent>
		</Card>
	);
}
