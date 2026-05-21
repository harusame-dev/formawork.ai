import { type Success, succeed } from "@harusame0616/result";
import { getAuth } from "@/features/auth/auth";

export async function logout(): Promise<Success<undefined>> {
  const auth = await getAuth();
  await auth.signOut();

  return succeed();
}
