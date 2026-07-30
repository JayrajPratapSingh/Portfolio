import { NextRequest, NextResponse } from "next/server";
import { getContent, setContent } from "@/lib/content";
import { getDefault, contentSections } from "@/lib/content-defaults";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Content from "@/models/Content";

type Ctx = { params: Promise<{ section: string }> };

function assertSection(section: string) {
  return contentSections.includes(section as never);
}

/** GET — public read; returns stored content or the typed default. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { section } = await params;
  if (!assertSection(section)) {
    return NextResponse.json({ message: "Unknown section" }, { status: 404 });
  }
  const data = await getContent(section, getDefault(section));
  return NextResponse.json({ section, data });
}

/** PUT — admin-only; replace a section's content (full update). */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { section } = await params;
  if (!assertSection(section)) {
    return NextResponse.json({ message: "Unknown section" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (body == null || typeof body !== "object") {
    return NextResponse.json({ message: "Body must be an object or array" }, { status: 400 });
  }

  const data = await setContent(section, body);
  return NextResponse.json({ section, data });
}

/** DELETE — admin-only; reset a section back to its typed default. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { section } = await params;
  if (!assertSection(section)) {
    return NextResponse.json({ message: "Unknown section" }, { status: 404 });
  }
  await dbConnect();
  await Content.deleteOne({ section: section.toLowerCase() });
  return NextResponse.json({ section, data: getDefault(section), reset: true });
}
