import { Resend } from "resend";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      message
    } = body;

    if (
      !name ||
      !email ||
      !message
    ) {
      return NextResponse.json(
        {
          message:"All fields required"
        },
        {
          status:400
        }
      );
    }
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || message.length > 5000) return NextResponse.json({ message: "Please provide a valid email and message" }, { status: 422 });
    try { await dbConnect(); await ContactMessage.create({ name, email, message }); } catch { /* Email delivery can still proceed when storage is unavailable. */ }

    const apiKey = process.env.RESEND_API_KEY;
    const receiver = process.env.CONTACT_RECEIVER;
    if (!apiKey || !receiver) return NextResponse.json({ success: true, preview: true });
    const resend = new Resend(apiKey);
    // Mail to YOU

    await resend.emails.send({
      from:
      "Portfolio <onboarding@resend.dev>",

      to:
      receiver,

      replyTo:
      email,

      subject:
      `🚀 New Contact: ${name}`,

      html:`
      <div style="
      font-family:Arial;
      padding:20px;
      ">

      <h2>
      New Contact Request
      </h2>

      <p>
      <b>Name:</b>
      ${name}
      </p>

      <p>
      <b>Email:</b>
      ${email}
      </p>

      <p>
      <b>Message:</b>
      </p>

      <p>
      ${message}
      </p>

      </div>
      `
    });


    // Auto reply to USER

    await resend.emails.send({

      from:
      "Jayraj Dev Labs <onboarding@resend.dev>",

      to:
      email,

      subject:
      "Message Received 🚀",

      html:`

      <div
      style="
      font-family:Arial;
      padding:20px;
      "
      >

      <h2>
      Hey ${name} 👋
      </h2>

      <p>
      I received your message.
      Thanks for reaching out.
      </p>

      <p>
      I'll connect with you soon.
      </p>

      <br/>

      <b>
      — Jayraj
      </b>

      </div>
      `
    });

    return NextResponse.json(
      {
        success:true
      },
      {
        status:200
      }
    );

  } catch(error){

    console.error(error);

    return NextResponse.json(
      {
        message:
        "Internal server error"
      },
      {
        status:500
      }
    );

  }
}
