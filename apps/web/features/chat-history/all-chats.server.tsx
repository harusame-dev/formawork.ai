import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { ChatListPresenter } from "./chat-list.universal";
import { getAllChats } from "./get-chats";

export async function AllChatsContainer({ page }: { page: number }) {
	await requireRole([UserRole.Admin]);
	const { chats, page: currentPage, totalPages } = await getAllChats(page);

	return (
		<div className="flex flex-col gap-3">
			<ChatListPresenter chats={chats} linkPrefix="/chat-history" />
			<p className="text-sm text-muted-foreground text-center">
				ページ {currentPage} / {totalPages}
			</p>
		</div>
	);
}
