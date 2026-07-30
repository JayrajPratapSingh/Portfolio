import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import {
  signToken,
  authCookieName,
  authCookieMaxAge,
  cookieOptions,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Wrong password" }, { status: 401 });
    }

    const token = signToken({ id: String(user._id), email: user.email });

    // Set the httpOnly cookie the middleware checks (fixes dashboard access).
    const res = NextResponse.json({ message: "Login success" });
    res.cookies.set(authCookieName, token, {
      ...cookieOptions,
      maxAge: authCookieMaxAge,
    });
    return res;
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
