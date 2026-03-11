import { notFound } from "next/navigation";
import { getUserDetail } from "./get-user-detail";
import { UserInfoPresenter } from "./user-info.universal";

type UserInfoContainerProps = {
	userIdPromise: Promise<string>;
};

export async function UserInfoContainer({
	userIdPromise,
}: UserInfoContainerProps) {
	const user = await getUserDetail(await userIdPromise);

	if (!user) {
		notFound();
	}

	return (
		<UserInfoPresenter firstName={user.firstName} lastName={user.lastName} />
	);
}
