import { Button } from "@workspace/ui/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { OrganizationListItem } from "./get-organizations";

export function OrganizationsPresenter({
	items,
}: {
	items: OrganizationListItem[];
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>カテゴリー</TableHead>
					<TableHead>組織名</TableHead>
					<TableHead className="w-px whitespace-nowrap text-right">
						操作
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.map((item) => {
					const rowKey = item.organization
						? `${item.categoryId}-${item.organization.organizationId}`
						: item.categoryId;
					return (
						<TableRow key={rowKey}>
							<TableCell className="font-medium">{item.categoryName}</TableCell>
							<TableCell>
								{item.organization ? (
									<Link
										className="underline-offset-4 hover:underline"
										href={
											`/organizations/${item.organization.organizationId}` as Route
										}
									>
										{item.organization.name}
									</Link>
								) : (
									<span className="text-muted-foreground">未登録</span>
								)}
							</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									{item.organization ? null : (
										<Button asChild size="sm" variant="outline">
											<Link
												href={
													`/organizations/new?categoryId=${item.categoryId}` as Route
												}
											>
												<Plus className="size-4" />
												登録
											</Link>
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
