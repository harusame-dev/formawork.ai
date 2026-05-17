import { notFound } from "next/navigation";
import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { getUserDetail } from "./get-user-detail";
import { UserInfoPresenter } from "./user-info.universal";

export async function UserInfoContainer({ userId }: { userId: string }) {
	await requireRole([UserRole.Admin]);
	const user = await getUserDetail(userId);
	if (!user) {
		notFound();
	}
	return <UserInfoPresenter user={user} />;
}
