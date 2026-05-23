import "dotenv/config";
import bcrypt from "bcryptjs";
import dbConnect from "../lib/db";
import User from "../models/User";

async function seed() {
  await dbConnect(); // 🔥 USE DB.TS HERE

  const existing = await User.findOne({
    email: process.env.ADMIN_EMAIL!,
  });

  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(
    process.env.ADMIN_PASSWORD!,
    10
  );

  await User.create({
    email: process.env.ADMIN_EMAIL!,
    password: hashed,
    role: "admin",
  });

  console.log("Admin created");
  process.exit(0);
}

seed();