import { notFound } from "next/navigation";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { getUserDetail } from "@/features/user/detail/get-user-detail";
import { EditUserForm } from "@/features/user/register/edit-user-form.client";

type UserEditFormContainerProps = {
	userIdPromise: Promise<string>;
};

export async function UserEditFormContainer({
	userIdPromise,
}: UserEditFormContainerProps) {
	const userId = await userIdPromise;
	const [user, currentUserStaffId] = await Promise.all([
		getUserDetail(userId),
		getUserStaffId(),
	]);

	if (!user) {
		notFound();
	}

	const isSelf = userId === currentUserStaffId;

	return (
		<EditUserForm
			authUserId={user.authUserId || ""}
			disabled={false}
			initialValues={{
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
			}}
			isSelf={isSelf}
			userId={userId}
		/>
	);
}
