/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import { updateSession } from "@repo/supabase/nextjs/proxy";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { getLoggerConfig } from "./config/logger";

const cronConfig = v.parse(
  v.union([
    v.object({
      cronSecret: v.pipe(
        v.string("CRON_SECRET は文字列である必要があります"),
        v.minLength(1, "CRON_SECRET は必須です"),
      ),
      environment: v.picklist(["production", "preview"]),
    }),
    v.object({
      environment: v.optional(v.literal("local"), "local"),
    }),
  ]),
  {
    cronSecret: process.env["CRON_SECRET"],
    environment: process.env["VERCEL_ENV"],
  },
);

function verifyCronSecret(request: NextRequest): boolean {
  // ローカル環境では検証をスキップ
  if (cronConfig.environment === "local") {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(" ");
  return scheme === "Bearer" && token === cronConfig.cronSecret;
}

function setLoggerHeaders(
  response: NextResponse,
  request: NextRequest,
  userId: string | null,
): void {
  const config = getLoggerConfig();

  response.headers.set(
    "x-request-id",
    request.headers.get("x-request-id") ?? crypto.randomUUID(),
  );
  response.headers.set("x-git-commit-sha", config.gitCommitSha ?? "");
  response.headers.set("x-deployment-id", config.deploymentId ?? "");
  response.headers.set("x-auth-user-id", userId ?? "");
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith("/api/cron")) {
    if (!verifyCronSecret(request)) {
      return NextResponse.json(null, { status: 401 });
    }
    return NextResponse.next();
  }

  const { response, userId } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const isLoggedIn = userId !== null;
  const isLoginPage = path === "/login";
  const isPublicPage = isLoginPage || path === "/lp";

  if (!isLoggedIn && !isPublicPage) {
    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url),
    );
    setLoggerHeaders(redirectResponse, request, userId);
    return redirectResponse;
  }

  if (isLoggedIn && isLoginPage) {
    const redirectResponse = NextResponse.redirect(
      new URL("/customers", request.url),
    );
    setLoggerHeaders(redirectResponse, request, userId);
    return redirectResponse;
  }

  setLoggerHeaders(response, request, userId);

  return response;
}

export const config = {
  matcher: [
    String.raw`/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-192x192\.png|icon-512x512\.png|apple-icon\.png).*)`,
  ],
};
