// middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Gate for `/dashboard`.
 *
 * This used to check only that a cookie named `token` existed, which meant any
 * value at all — `token=anything` — rendered the admin shell. The API routes
 * verify properly, so no data leaked, but the UI should not open for a forged
 * cookie either.
 *
 * Verification uses `jose` rather than `jsonwebtoken` because middleware runs
 * on the Edge runtime, where node's `crypto` is unavailable. Both sign and
 * verify HS256 against the same `JWT_SECRET`, so tokens issued by `/api/login`
 * validate here unchanged.
 */

const encoder = new TextEncoder();

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    await jwtVerify(token, encoder.encode(process.env.JWT_SECRET));
    return true;
  } catch {
    // Expired, tampered with, or signed by something else.
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!(await isValidToken(token))) {
    const url = new URL("/admin/login", req.url);
    const res = NextResponse.redirect(url);
    // Clear the bad cookie so the browser stops sending it on every request.
    if (token) res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
