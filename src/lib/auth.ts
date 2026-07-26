import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export type AuthPayload = { id: string; email: string; role: "admin" };

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not configured");
  return value;
}

export function createToken(payload: AuthPayload) { return jwt.sign(payload, secret(), { expiresIn: "7d" }); }
export function readToken(token?: string): AuthPayload | null {
  if (!token) return null;
  try { return jwt.verify(token, secret()) as AuthPayload; } catch { return null; }
}
export function requestUser(request: NextRequest) { return readToken(request.cookies.get("admin_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")); }
