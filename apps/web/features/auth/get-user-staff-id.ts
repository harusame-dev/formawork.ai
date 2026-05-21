import { getAuth } from "./auth";

export async function getUserStaffId(): Promise<string | null> {
  const auth = await getAuth();
  const user = await auth.getAuthUser();

  return user?.staffId ?? null;
}
