import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { email, password, setupSecret } = await request.json();
  if (!process.env.ADMIN_SETUP_SECRET || setupSecret !== process.env.ADMIN_SETUP_SECRET) return NextResponse.json({ message: "Invalid setup secret" }, { status: 403 });
  if (!email || typeof password !== "string" || password.length < 8) return NextResponse.json({ message: "Use a valid email and a password of at least 8 characters" }, { status: 422 });
  await dbConnect(); const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return NextResponse.json({ message: "Account not found" }, { status: 404 });
  user.password = await bcrypt.hash(password, 12); await user.save();
  return NextResponse.json({ success: true, message: "Password updated. You can now sign in." });
}
