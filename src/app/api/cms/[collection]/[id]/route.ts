import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContentEntry from "@/models/ContentEntry";
import { requestUser } from "@/lib/auth";

async function guard(request: NextRequest) { return requestUser(request); }
export async function PATCH(request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) { const user = await guard(request); if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); const { collection, id } = await context.params; const body = await request.json(); await dbConnect(); const entry = await ContentEntry.findOneAndUpdate({ _id: id, contentType: collection }, body, { new: true, runValidators: true }); return entry ? NextResponse.json(entry) : NextResponse.json({ message: "Not found" }, { status: 404 }); }
export async function DELETE(request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) { const user = await guard(request); if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); const { collection, id } = await context.params; await dbConnect(); const entry = await ContentEntry.findOneAndDelete({ _id: id, contentType: collection }); return entry ? new NextResponse(null, { status: 204 }) : NextResponse.json({ message: "Not found" }, { status: 404 }); }
