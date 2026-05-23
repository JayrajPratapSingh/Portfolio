import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

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

    // Mail to YOU

    await resend.emails.send({
      from:
      "Portfolio <onboarding@resend.dev>",

      to:
      process.env.CONTACT_RECEIVER!,

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