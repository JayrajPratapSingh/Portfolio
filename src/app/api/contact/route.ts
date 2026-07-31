import { Resend } from "resend";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * POST /api/contact — handles a contact submission.
 * 1. Persists it to the DB (so nothing is lost, even if email fails).
 * 2. Best-effort emails the owner + an auto-reply to the sender.
 * A failure in step 2 does not fail the request as long as step 1 succeeded.
 */
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: "All fields required" }, { status: 400 });
    }

    // 1) Persist (best-effort — DB may be unavailable in dev).
    let stored = false;
    try {
      await dbConnect();
      await Message.create({ name, email, message });
      stored = true;
    } catch (err) {
      console.error("[contact] failed to store message:", err);
    }

    // 2) Notify by email (best-effort).
    let emailed = false;
    if (resend && process.env.CONTACT_RECEIVER) {
      try {
        await resend.emails.send({
          from: "Portfolio <onboarding@resend.dev>",
          to: process.env.CONTACT_RECEIVER,
          replyTo: email,
          subject: `🚀 New Contact: ${name}`,
          html: `
            <div style="font-family:Arial;padding:20px">
              <h2>New Contact Request</h2>
              <p><b>Name:</b> ${name}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Message:</b></p>
              <p>${message}</p>
            </div>`,
        });

        await resend.emails.send({
          from: "Jayraj Dev Labs <onboarding@resend.dev>",
          to: email,
          subject: "Message Received 🚀",
          html: `
            <div style="font-family:Arial;padding:20px">
              <h2>Hey ${name} 👋</h2>
              <p>I received your message. Thanks for reaching out.</p>
              <p>I'll connect with you soon.</p>
              <br/>
              <b>— Jayraj</b>
            </div>`,
        });
        emailed = true;
      } catch (err) {
        console.error("[contact] email send failed:", err);
      }
    }

    if (!stored && !emailed) {
      return NextResponse.json(
        { message: "Could not deliver your message. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, stored, emailed }, { status: 200 });
  } catch (error) {
    console.error("[contact] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
