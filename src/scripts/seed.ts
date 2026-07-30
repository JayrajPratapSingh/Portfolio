import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import dbConnect from "../lib/db";
import Content from "../models/Content";
import User from "../models/User";

import { hero } from "../data/hero";
import { about } from "../data/about";
import { projects } from "../data/projects";
import { socials } from "../data/social";
import { siteConfig } from "../lib/constants";

const seoDefault = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  url: siteConfig.url,
  ogImage: siteConfig.ogImage,
};

const sections: Record<string, unknown> = {
  hero,
  about,
  projects,
  social: socials,
  seo: seoDefault,
};

async function run() {
  await dbConnect();

  // 1) content sections
  for (const [section, data] of Object.entries(sections)) {
    await Content.findOneAndUpdate(
      { section },
      { data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`✓ seeded content: ${section}`);
  }

  // 2) admin user (from env)
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`• admin already exists: ${email}`);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      await User.create({ email: email.toLowerCase(), password: hashed, role: "admin" });
      console.log(`✓ created admin: ${email}`);
    }
  } else {
    console.log("• skipped admin (set ADMIN_EMAIL + ADMIN_PASSWORD in .env.local)");
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
