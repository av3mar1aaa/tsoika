import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signSession,
  verifyCredentials,
  SESSION_CONFIG,
  isLoginRateLimited,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/auth";

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  if (isLoginRateLimited(ip)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите 10 минут." },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "Укажите логин и пароль" },
      { status: 400 },
    );
  }

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    recordLoginFailure(ip);
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  recordLoginSuccess(ip);

  const token = await signSession(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_CONFIG.maxAge,
  });

  return NextResponse.json({ ok: true });
}
