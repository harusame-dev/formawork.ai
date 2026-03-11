import type { UsersConditionSearchParams } from "./schema";
import { UserSearchForm } from "./user-search-form.client";

export async function UserSearchFormContainer({
	conditionPromise,
}: {
	conditionPromise: Promise<Omit<UsersConditionSearchParams, "page">>;
}) {
	return <UserSearchForm condition={await conditionPromise} />;
}
