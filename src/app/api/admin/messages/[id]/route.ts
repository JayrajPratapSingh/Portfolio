import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH — admin-only; toggle/set read state on a message. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: { read?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body → default toggle handled below */
  }

  try {
    await dbConnect();
    const doc = await Message.findById(id);
    if (!doc) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    doc.read = typeof body.read === "boolean" ? body.read : !doc.read;
    await doc.save();
    return NextResponse.json({ id, read: doc.read });
  } catch (err) {
    console.error("[messages] patch failed:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

/** DELETE — admin-only; remove a message. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await dbConnect();
    await Message.deleteOne({ _id: id });
    return NextResponse.json({ id, deleted: true });
  } catch (err) {
    console.error("[messages] delete failed:", err);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
