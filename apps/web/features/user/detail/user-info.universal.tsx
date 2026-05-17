import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import type { UserDetail } from "./get-user-detail";

export function UserInfoPresenter({ user }: { user: UserDetail }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{user.email || "(メアド不明)"}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 text-sm">
				<div>
					<span className="text-muted-foreground">所属組織: </span>
					{user.organizationName}
				</div>
				<div>
					<span className="text-muted-foreground">ロール: </span>
					{user.role === "admin" ? "管理者" : "組織ユーザー"}
				</div>
			</CardContent>
		</Card>
	);
}
