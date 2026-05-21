import { fail, type Result, succeed } from "@harusame0616/result";
import { getAuth } from "@/features/auth/auth";
import type { LoginParams as LoginParameters } from "./schema";

const LoginErrorMessage =
  "ログインできませんでした。メールアドレス・パスワードを確認し、解決しない場合は時間をおくか管理者にお問い合わせください。" as const;

export async function login(
  parameters: LoginParameters,
): Promise<Result<void, typeof LoginErrorMessage>> {
  const auth = await getAuth();
  const result = await auth.signInWithPassword({
    email: parameters.username,
    password: parameters.password,
  });

  if (!result.success) {
    return fail(LoginErrorMessage);
  }

  return succeed();
}
