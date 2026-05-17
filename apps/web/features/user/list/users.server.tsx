import { UserRole } from "@/features/auth/get-user-role";
import { requireRole } from "@/features/auth/require-role";
import { getUsers } from "./get-users";
import type { UsersCondition } from "./schema";
import { UsersPresenter } from "./users.universal";

export async function UsersContainer({
	condition,
}: {
	condition: Promise<UsersCondition>;
}) {
	await requireRole([UserRole.Admin]);
	const { users, page, totalPages } = await getUsers(await condition);

	return <UsersPresenter page={page} totalPages={totalPages} users={users} />;
}
