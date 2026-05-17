import { Card, CardContent } from "@workspace/ui/components/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import Link from "next/link";
import type { User } from "./get-users";

export function UsersPresenter({
	users,
	page,
	totalPages,
}: {
	users: User[];
	page: number;
	totalPages: number;
}) {
	if (users.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					ユーザーが登録されていません
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>メールアドレス</TableHead>
							<TableHead>所属組織</TableHead>
							<TableHead>ロール</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.userId}>
								<TableCell>
									<Link
										className="text-primary hover:underline"
										href={`/users/${user.userId}`}
									>
										{user.email || "(メアド不明)"}
									</Link>
								</TableCell>
								<TableCell>{user.organizationName}</TableCell>
								<TableCell>
									{user.role === "admin" ? "管理者" : "組織ユーザー"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
			<p className="text-sm text-muted-foreground text-center">
				ページ {page} / {totalPages}
			</p>
		</div>
	);
}
