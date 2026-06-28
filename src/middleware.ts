import { NextResponse, type NextRequest } from "next/server";
import { env, features } from "@/lib/env";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";

/** Paths reachable without the password. */
function isPublic(path: string): boolean {
  return (
    path.startsWith("/login") ||
    path.startsWith("/api/auth/") ||
    // Device push uses a Bearer token, not a browser session — must bypass.
    path === "/api/health/ingest"
  );
}

/**
 * Single-password gate. When APP_PASSWORD is set, every route requires a valid
 * session cookie; otherwise the app stays open (local-first, runs with no keys).
 */
export async function middleware(request: NextRequest) {
  if (!features.auth) return NextResponse.next();

  const path = request.nextUrl.pathname;
  const expected = await sessionToken(env.APP_PASSWORD!);
  const authed = request.cookies.get(SESSION_COOKIE)?.value === expected;

  if (isPublic(path)) {
    if (path.startsWith("/login") && authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
