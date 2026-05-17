import { createClient } from "@repo/supabase/nextjs/server";
import { UserRole } from "./user/role";

export { UserRole } from "./user/role";

export async function getUserRole(): Promise<UserRole | null> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const role = user.app_metadata?.["role"] as string | undefined;

	switch (role) {
		case UserRole.Admin:
			return UserRole.Admin;
		case UserRole.OrgUser:
			return UserRole.OrgUser;
		default:
			return null;
	}
}
