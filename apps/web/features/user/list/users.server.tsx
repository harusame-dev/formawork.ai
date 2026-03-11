import { getUsers } from "./get-users";
import type { UsersCondition } from "./schema";
import { UsersPresenter } from "./users.universal";

export async function UsersContainer({
	condition,
}: {
	condition: Promise<UsersCondition>;
}) {
	const { users, page, totalPages } = await getUsers(await condition);

	return <UsersPresenter page={page} totalPages={totalPages} users={users} />;
}
