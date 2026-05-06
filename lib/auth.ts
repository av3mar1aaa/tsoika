import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "tsoika_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET must be set in .env.local (minimum 16 chars)",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<{ username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string") return null;
    return { username: payload.sub };
  } catch {
    return null;
  }
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !hash) return false;
  if (username !== expectedUser) return false;
  return bcrypt.compare(password, hash);
}

export const SESSION_CONFIG = {
  cookieName: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE,
} as const;

const FAIL_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS_IN_WINDOW = 5;

const loginAttempts = new Map<
  string,
  { failed: number; firstFailAt: number }
>();

export function isLoginRateLimited(ip: string): boolean {
  const e = loginAttempts.get(ip);
  if (!e) return false;
  if (Date.now() - e.firstFailAt > FAIL_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return e.failed >= MAX_FAILS_IN_WINDOW;
}

export function recordLoginFailure(ip: string): void {
  const e = loginAttempts.get(ip);
  if (!e || Date.now() - e.firstFailAt > FAIL_WINDOW_MS) {
    loginAttempts.set(ip, { failed: 1, firstFailAt: Date.now() });
  } else {
    e.failed += 1;
  }
}

export function recordLoginSuccess(ip: string): void {
  loginAttempts.delete(ip);
}
