import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_CONFIG } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
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
