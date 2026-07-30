import { NextResponse } from "next/server";
import { authCookieName, cookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set(authCookieName, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
