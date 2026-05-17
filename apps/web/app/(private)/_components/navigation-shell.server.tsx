import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { NavigationMenu } from "./navigation-menu.client";

export async function NavigationShell() {
	const role = await getUserRole();

	// 組織ユーザーはメニュー表示なし（自組織画面のみ利用）
	if (role !== UserRole.Admin) {
		return null;
	}

	return <NavigationMenu />;
}
