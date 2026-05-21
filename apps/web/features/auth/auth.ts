import { fail, type Result, succeed } from "@harusame0616/result";
import { createClient } from "@repo/supabase/nextjs/server";
import { AuthError } from "./auth-error";
import { UserRole } from "./user/role";

export { AuthError } from "./auth-error";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface AuthUser {
  role: UserRole;
  staffId: string | null;
}

interface AppMetadata {
  role?: UserRole;
  staffId?: string;
}

interface Auth {
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

function toAuthUserRole(value: unknown): UserRole {
  switch (value) {
    case UserRole.Admin: {
      return UserRole.Admin;
    }
    case UserRole.User:
    case undefined: {
      return UserRole.User;
    }
    default: {
      throw new Error("不明なロールです。");
    }
  }
}

export async function getAuth(): Promise<Auth> {
  return new SupabaseAuth(await createClient());
}

class SupabaseAuth implements Auth {
  constructor(private readonly supabase: SupabaseClient) {}

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<void, AuthError>> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return fail(AuthError.InvalidCredentials);
    }
    return succeed();
  }

  async signOut(): Promise<Result<void, AuthError>> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      return fail(AuthError.SignOutFailed);
    }
    return succeed();
  }

  async getAuthUser(): Promise<AuthUser | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const metadata = user.app_metadata as AppMetadata | undefined;
    return {
      role: toAuthUserRole(metadata?.role),
      staffId: metadata?.staffId ?? null,
    };
  }

  async verifyCurrentPassword(
    currentPassword: string,
  ): Promise<Result<void, AuthError>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user?.email) {
      return fail(AuthError.SessionExpired);
    }

    const { error } = await this.supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (error) {
      return fail(AuthError.InvalidCredentials);
    }
    return succeed();
  }

  async updatePassword(newPassword: string): Promise<Result<void, AuthError>> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return fail(AuthError.UpdateFailed);
    }
    return succeed();
  }
}
