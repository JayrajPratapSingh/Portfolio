import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, setupSecret } = await req.json();
    if (!process.env.ADMIN_SETUP_SECRET || setupSecret !== process.env.ADMIN_SETUP_SECRET) return NextResponse.json({ message: "Registration is disabled" }, { status: 403 });
    if (!email || typeof password !== "string" || password.length < 8) return NextResponse.json({ message: "Use a valid email and a password of at least 8 characters" }, { status: 422 });

     await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    return NextResponse.json({
      message: "User created",
      user: {
        email: user.email,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
