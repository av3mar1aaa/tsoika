import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_CONFIG } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (
      pathname.startsWith("/api/admin") &&
      request.method !== "GET" &&
      request.method !== "HEAD"
    ) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (host && originHost !== host) {
            return NextResponse.json(
              { error: "Cross-origin запросы запрещены" },
              { status: 403 },
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Cross-origin запросы запрещены" },
            { status: 403 },
          );
        }
      }
    }

    const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;
    const session = await verifySession(token);

    if (!session) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "Необходима авторизация" },
          { status: 401 },
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
