import { NextRequest, NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";

export const runtime = "nodejs";

/** GET /api/admin/chats — admin-only. Recent assistant conversations. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const onlyGaps = req.nextUrl.searchParams.get("gaps") === "1";
  const query = onlyGaps ? { unanswered: true } : {};

  const data = await Conversation.find(query)
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ data });
}

/** DELETE /api/admin/chats?id=... — remove one stored transcript. */
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  await dbConnect();
  await Conversation.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
