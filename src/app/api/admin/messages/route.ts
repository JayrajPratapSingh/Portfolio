import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

/** GET /api/admin/messages — admin-only list of contact submissions. */
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    const unread = messages.filter((m) => !m.read).length;
    return NextResponse.json({ messages, unread });
  } catch (err) {
    console.error("[messages] list failed:", err);
    // Resilient — return an empty list rather than 500 so the panel still loads.
    return NextResponse.json({ messages: [], unread: 0, error: true });
  }
}
