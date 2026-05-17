import { Card, CardContent } from "@workspace/ui/components/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import type { Route } from "next";
import Link from "next/link";
import { formatOrgDisplayName } from "@/features/organization/format-display-name";
import type { ChatSummary } from "./get-chats";

export function ChatListPresenter({
	chats,
	emptyMessage = "チャットがありません",
	linkPrefix,
}: {
	chats: ChatSummary[];
	emptyMessage?: string;
	linkPrefix: string;
}) {
	function buildHref(chatId: string): Route {
		return `${linkPrefix}/${chatId}` as Route;
	}
	if (chats.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					{emptyMessage}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>チャット ID</TableHead>
						<TableHead>紹介元組織</TableHead>
						<TableHead>相談者メアド</TableHead>
						<TableHead>最終アクセス</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{chats.map((chat) => (
						<TableRow key={chat.chatId}>
							<TableCell>
								<Link
									className="text-primary hover:underline"
									href={buildHref(chat.chatId)}
								>
									{chat.chatId.slice(0, 8)}…
								</Link>
							</TableCell>
							<TableCell>
								{formatOrgDisplayName(chat.referrerOrgName)}
							</TableCell>
							<TableCell>
								{chat.contactEmail ? (
									<a
										className="text-primary hover:underline"
										href={`mailto:${chat.contactEmail}`}
									>
										{chat.contactEmail}
									</a>
								) : (
									"(未取得)"
								)}
							</TableCell>
							<TableCell className="text-xs">
								{chat.lastAccessedAt.toISOString().slice(0, 16)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}
