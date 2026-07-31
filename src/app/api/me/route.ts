import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/me — returns the currently signed-in admin (from the httpOnly
 * cookie) or `{ user: null }`. Used by the client `useAuth` hook to switch the
 * navbar into its logged-in state. Never throws.
 */
export async function GET() {
  const user = await getAuthUser();
  return NextResponse.json(
    { user: user ? { id: user.id, email: user.email } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
