import type { Result } from "@harusame0616/result";
import { createClient } from "@repo/supabase/nextjs/server";
import type { AuthError } from "./auth-error";
import { SupabaseAuth } from "./supabase-auth";
import type { UserRole } from "./user/role";

export { AuthError } from "./auth-error";

export interface AuthUser {
  role: UserRole;
  staffId: string | null;
}

export interface Auth {
  signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<Result<void, AuthError>>;
  signOut(): Promise<Result<void, AuthError>>;
  getAuthUser(): Promise<AuthUser | null>;
  verifyCurrentPassword(
    currentPassword: string,
  ): Promise<Result<void, AuthError>>;
  updatePassword(newPassword: string): Promise<Result<void, AuthError>>;
}

export async function getAuth(): Promise<Auth> {
  return new SupabaseAuth(await createClient());
}
