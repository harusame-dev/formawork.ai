import { SearchPagination } from "@workspace/ui/components/search-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import type { UsersListItem } from "./schema";

type UsersPresenterProps = {
	users: UsersListItem[];
	page: number;
	totalPages: number;
};

export function UsersPresenter({
	users,
	page,
	totalPages,
}: UsersPresenterProps) {
	if (!users.length) {
		return (
			<div className="space-y-4">
				<div className="text-center py-8 text-muted-foreground">
					ユーザーが見つかりませんでした
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>名前</TableHead>
						<TableHead>メールアドレス</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.userId}>
							<TableCell>
								<Link
									className="text-primary underline"
									href={`/users/${user.userId}`}
								>
									{user.lastName} {user.firstName}
								</Link>
							</TableCell>
							<TableCell>{user.email || "-"}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<SearchPagination currentPage={page} totalPages={totalPages} />
		</div>
	);
}
