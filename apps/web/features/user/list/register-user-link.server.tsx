import Link from "next/link";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";

export async function RegisterUserLink() {
	const role = await getUserRole();

	if (role === UserRole.Admin) {
		return (
			<Link className="text-sm underline" href="/users/new">
				新規登録
			</Link>
		);
	}

	return null;
}
