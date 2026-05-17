import { forbidden } from "next/navigation";
import { getUserRole, type UserRole } from "./get-user-role";

// Suspense 配下で呼び出す前提。許可ロールでなければ forbidden() を投げる
export async function requireRole(allowed: UserRole[]): Promise<UserRole> {
	const role = await getUserRole();
	if (!role || !allowed.includes(role)) {
		forbidden();
	}
	return role;
}
