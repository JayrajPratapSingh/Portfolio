import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import {
  getAuthUser,
  signToken,
  authCookieName,
  authCookieMaxAge,
  cookieOptions,
} from "@/lib/auth";

/** GET — current admin (email only). */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ email: auth.email });
}

/**
 * PUT — change email and/or password. Requires the current password.
 * Re-issues the auth cookie if the email changes.
 */
export async function PUT(req: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { currentPassword, newEmail, newPassword } = await req.json();

  if (!currentPassword) {
    return NextResponse.json(
      { message: "Current password is required" },
      { status: 400 },
    );
  }

  await dbConnect();
  const user = await User.findById(auth.id);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
  }

  if (newEmail) user.email = String(newEmail).toLowerCase().trim();
  if (newPassword) {
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  const res = NextResponse.json({ message: "Account updated", email: user.email });
  if (newEmail) {
    const token = signToken({ id: String(user._id), email: user.email });
    res.cookies.set(authCookieName, token, { ...cookieOptions, maxAge: authCookieMaxAge });
  }
  return res;
}
