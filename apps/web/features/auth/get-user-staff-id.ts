import { createClient } from "@repo/supabase/nextjs/server";

export async function getUserStaffId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const staffId = user.app_metadata?.["staffId"] as string | undefined;

  return staffId ?? null;
}
