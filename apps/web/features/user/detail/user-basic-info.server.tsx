import { notFound } from "next/navigation";
import { getUserDetail } from "./get-user-detail";
import { UserBasicInfoPresenter } from "./user-basic-info.universal";

type UserBasicInfoContainerProps = {
	userIdPromise: Promise<string>;
};

export async function UserBasicInfoContainer({
	userIdPromise,
}: UserBasicInfoContainerProps) {
	const userId = await userIdPromise;
	const user = await getUserDetail(userId);

	if (!user) {
		notFound();
	}

	return <UserBasicInfoPresenter user={user} />;
}
