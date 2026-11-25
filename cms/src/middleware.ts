import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLE_HOME_ROUTES, ROLE_ALLOWED_PREFIXES } from "@/lib/constants/navigation";
import type { UserRole } from "@/types/auth";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const roleCookie = request.cookies.get("layah_role")?.value as UserRole | undefined;
  const tokenCookie = request.cookies.get("layah_token")?.value;
  const isAuthenticated = Boolean(roleCookie && tokenCookie);

  if (PUBLIC_PATHS.includes(pathname)) {
    if (isAuthenticated && roleCookie && ROLE_HOME_ROUTES[roleCookie]) {
      return NextResponse.redirect(new URL(ROLE_HOME_ROUTES[roleCookie], request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (isAuthenticated && roleCookie && ROLE_HOME_ROUTES[roleCookie]) {
      return NextResponse.redirect(new URL(ROLE_HOME_ROUTES[roleCookie], request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isAuthenticated || !roleCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[roleCookie] ?? [];
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowed) {
    const fallback = ROLE_HOME_ROUTES[roleCookie] ?? "/login";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
