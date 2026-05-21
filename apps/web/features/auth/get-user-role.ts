import { type AuthUser, getAuth } from "./auth";
import { UserRole } from "./user/role";

export { UserRole } from "./user/role";

export async function getUserRole(): Promise<UserRole> {
  const auth = await getAuth();
  const user: AuthUser | null = await auth.getAuthUser();

  if (!user) {
    return UserRole.User;
  }

  return user.role;
}
