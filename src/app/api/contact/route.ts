import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";

import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { checkRateLimit, clientIp, hashIp, rateLimits } from "@/lib/rate-limit";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * POST /api/contact — handles a contact submission.
 * 1. Persists it to the DB (so nothing is lost, even if email fails).
 * 2. Best-effort emails the owner + an auto-reply to the sender.
 * A failure in step 2 does not fail the request as long as step 1 succeeded.
 *
 * Two things make this endpoint riskier than it looks, and both are handled
 * below. It sends mail to an address the *sender* supplies, which without a cap
 * is an open relay someone can point at any victim. And it puts sender-supplied
 * text into an HTML email, which without escaping is markup injection straight
 * into the owner's inbox.
 */

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  // Real validation, not just a presence check: this value becomes an email
  // recipient, so anything malformed must never reach the mail provider.
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
});

/** Escape the five characters that can break out of HTML text or an attribute. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const parsed = ContactSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide a name, a valid email and a message." },
        { status: 400 },
      );
    }
    const { name, email, message } = parsed.data;

    const rate = await checkRateLimit({
      ...rateLimits.contact,
      ipHash: hashIp(clientIp(req)),
    });

    /**
     * The two emails carry different risk, so a degraded limiter is handled
     * per-email rather than by rejecting the request.
     *
     * The owner notification goes to a fixed address from the environment — it
     * can't be aimed at anyone, so losing a real enquiry to a database blip
     * would be worse than sending it uncounted. The auto-reply goes wherever
     * the sender says, so it requires the durable counter: the in-process
     * fallback is per-instance, and "3 per hour per instance" is not a cap a
     * distributed sender would notice.
     */
    const allowAutoReply = rate.ok && !rate.degraded;

    if (!rate.ok) {
      return NextResponse.json(
        { message: "Too many messages from this address. Please try again later." },
        {
          status: 429,
          headers: { "retry-after": String(rate.retryAfterSeconds ?? 3600) },
        },
      );
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

    // 2) Notify by email (best-effort). Every interpolated value is escaped.
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

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
              <p><b>Name:</b> ${safeName}</p>
              <p><b>Email:</b> ${safeEmail}</p>
              <p><b>Message:</b></p>
              <p>${safeMessage}</p>
            </div>`,
        });

        // Auto-reply goes to a sender-supplied address, so it runs only when
        // the limiter actually counted this request.
        if (allowAutoReply) {
          await resend.emails.send({
            from: "Jayraj Dev Labs <onboarding@resend.dev>",
            to: email,
            subject: "Message Received 🚀",
            html: `
              <div style="font-family:Arial;padding:20px">
                <h2>Hey ${safeName} 👋</h2>
                <p>I received your message. Thanks for reaching out.</p>
                <p>I'll connect with you soon.</p>
                <br/>
                <b>— Jayraj</b>
              </div>`,
          });
        }
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
