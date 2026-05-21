import { fail, type Result, succeed } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { AuthError } from "./auth-error";
import type { UserRole } from "./user/role";

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

interface AdminUserMetadata {
  role?: UserRole;
  staffId?: string;
}

interface AdminUser {
  id: string;
  email: string | undefined;
  appMetadata: AdminUserMetadata;
}

interface AuthAdmin {
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

class SupabaseAuthAdmin implements AuthAdmin {
  constructor(private readonly supabase: AdminSupabaseClient) {}

  async createUser(params: {
    id?: string;
    email: string;
    password: string;
    emailConfirm?: boolean;
    appMetadata?: AdminUserMetadata;
  }): Promise<Result<{ id: string }, AuthError>> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      app_metadata: params.appMetadata,
      email: params.email,
      email_confirm: params.emailConfirm ?? true,
      id: params.id,
      password: params.password,
    });

    if (error) {
      if (error.code === "email_exists") {
        return fail(AuthError.EmailExists);
      }
      return fail(AuthError.CreateFailed);
    }
    return succeed({ id: data.user.id });
  }

  async updateUserById(
    id: string,
    params: {
      email?: string;
      appMetadata?: AdminUserMetadata;
    },
  ): Promise<Result<void, AuthError>> {
    const { error } = await this.supabase.auth.admin.updateUserById(id, {
      app_metadata: params.appMetadata,
      email: params.email,
    });
    if (error) {
      return fail(AuthError.UpdateFailed);
    }
    return succeed();
  }

  async deleteUser(id: string): Promise<Result<void, AuthError>> {
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) {
      return fail(AuthError.DeleteFailed);
    }
    return succeed();
  }

  async listUsers(): Promise<Result<AdminUser[], AuthError>> {
    const { data, error } = await this.supabase.auth.admin.listUsers();
    if (error) {
      return fail(AuthError.ListFailed);
    }
    return succeed(
      data.users.map((user) => ({
        appMetadata: (user.app_metadata ?? {}) as AdminUserMetadata,
        email: user.email,
        id: user.id,
      })),
    );
  }
}
