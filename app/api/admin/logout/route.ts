import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_CONFIG } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.cookieName);
  return NextResponse.json({ ok: true });
}
