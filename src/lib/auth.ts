import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET as string;
const COOKIE = "token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthPayload {
  id: string;
  email: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/** Options for the auth cookie (set on login, cleared on logout). */
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const authCookieName = COOKIE;
export const authCookieMaxAge = MAX_AGE;

/** Read + verify the current admin from the request cookie. Null if not signed in. */
export async function getAuthUser(): Promise<AuthPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
