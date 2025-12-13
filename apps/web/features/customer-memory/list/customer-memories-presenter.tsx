import {
	MEMORY_CATEGORY_LABEL,
	type MemoryCategory,
	type SelectCustomerMemory,
} from "@workspace/db/schema/customer-memory";
import { Card, CardContent } from "@workspace/ui/components/card";
import { MAX_MEMORIES } from "./constants";
import { CustomerMemoryLockButton } from "./customer-memory-lock-button";

type CustomerMemoriesPresenterProps = {
	customerId: string;
	memories: SelectCustomerMemory[];
};

export function CustomerMemoriesPresenter({
	customerId,
	memories,
}: CustomerMemoriesPresenterProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<table aria-label="顧客メモリ一覧" className="w-full">
					<caption className="sr-only">
						顧客のメモリ情報を番号、カテゴリ、内容、重要度の順で表示しています
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
							<th className="w-14 py-2 px-2 text-center" scope="col">
								保護
							</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: MAX_MEMORIES }, (_, index) => {
							const memory = memories[index];
							const category = memory
								? MEMORY_CATEGORY_LABEL[memory.category as MemoryCategory]
								: "-";
							const content = memory?.content ?? "-";
							const importance = memory?.importance ?? "-";

							return (
								<tr
									className="border-b last:border-b-0 flex flex-wrap sm:table-row py-2 sm:py-0 min-h-14 sm:min-h-0"
									key={memory?.id ?? `empty-${index}`}
								>
									<td className="text-sm text-muted-foreground sm:table-cell sm:w-12 sm:py-2 sm:px-2">
										<span aria-hidden="true" className="sm:hidden">
											#
										</span>
										{index + 1}
									</td>
									<td className="text-sm sm:table-cell sm:py-2 sm:px-2 ml-2 sm:ml-0">
										{category}
									</td>
									<td
										aria-label={`重要度: ${importance}`}
										className="text-sm text-muted-foreground sm:hidden ml-auto"
									>
										重要度:
										<span className="ml-1 inline-block w-3">{importance}</span>
									</td>
									<td className="text-sm w-full sm:w-auto sm:table-cell sm:py-2 sm:px-2 pl-6 sm:pl-2 mt-1 sm:mt-0 text-muted-foreground sm:text-foreground">
										{content}
									</td>
									<td className="text-sm text-center hidden sm:table-cell sm:w-16 sm:py-2 sm:px-2">
										{importance}
									</td>
									<td className="ml-auto sm:ml-0 text-center sm:table-cell sm:w-12 sm:py-2 sm:px-2">
										{memory && (
											<CustomerMemoryLockButton
												customerId={customerId}
												isProtected={memory.isProtected}
												memoryId={memory.id}
											/>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</CardContent>
		</Card>
	);
}
