import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContentEntry from "@/models/ContentEntry";
import { requestUser } from "@/lib/auth";

const collections = new Set(["home", "hero", "about", "skills", "experience", "projects", "achievements", "certificates", "testimonials", "blogs", "resume", "social-links", "seo", "site-settings", "theme"]);
const valid = (value: string) => collections.has(value);

export async function GET(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params; if (!valid(collection)) return NextResponse.json({ message: "Unknown content collection" }, { status: 404 });
  // A public portfolio should still render with its local defaults before MongoDB is configured.
  if (!process.env.MONGODB_URI?.trim()) return NextResponse.json([]);
  await dbConnect(); const admin = requestUser(request); const query = admin ? { contentType: collection } : { contentType: collection, published: true };
  return NextResponse.json(await ContentEntry.find(query).sort({ createdAt: -1 }).lean());
}
export async function POST(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params; if (!valid(collection)) return NextResponse.json({ message: "Unknown content collection" }, { status: 404 });
  if (!requestUser(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json(); if (!body.slug || typeof body.data !== "object") return NextResponse.json({ message: "slug and data are required" }, { status: 422 });
  await dbConnect(); const entry = await ContentEntry.create({ contentType: collection, slug: body.slug, title: body.title ?? "", data: body.data, published: Boolean(body.published) });
  return NextResponse.json(entry, { status: 201 });
}
