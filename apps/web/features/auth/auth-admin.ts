import type { Result } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import type { AuthError } from "./auth-error";
import { SupabaseAuthAdmin } from "./supabase-auth-admin";
import type { UserRole } from "./user/role";

export interface AdminUserMetadata {
  role?: UserRole;
  staffId?: string;
}

export interface AdminUser {
  id: string;
  email: string | undefined;
  appMetadata: AdminUserMetadata;
}

export interface AuthAdmin {
  createUser(params: {
    id?: string;
    email: string;
    password: string;
    emailConfirm?: boolean;
    appMetadata?: AdminUserMetadata;
  }): Promise<Result<{ id: string }, AuthError>>;
  updateUserById(
    id: string,
    params: {
      email?: string;
      appMetadata?: AdminUserMetadata;
    },
  ): Promise<Result<void, AuthError>>;
  deleteUser(id: string): Promise<Result<void, AuthError>>;
  listUsers(): Promise<Result<AdminUser[], AuthError>>;
}

export function getAuthAdmin(): AuthAdmin {
  return new SupabaseAuthAdmin(createAdminClient());
}
