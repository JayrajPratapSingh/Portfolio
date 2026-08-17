import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import {
  signToken,
  authCookieName,
  authCookieMaxAge,
  cookieOptions,
} from "@/lib/auth";
import {
  checkRateLimit,
  clearRateLimit,
  clientIp,
  hashIp,
  rateLimits,
} from "@/lib/rate-limit";

/**
 * POST /api/login — admin sign-in.
 *
 * Two deliberate choices here. Attempts are rate-limited per IP, because a
 * public login form with no cap is an open invitation to guess the password at
 * machine speed. And every failure returns the *same* message: distinguishing
 * "no such user" from "wrong password" tells an attacker which addresses are
 * real admins, which is half the work of breaking in.
 */

const GENERIC_FAILURE = "Invalid email or password";

export async function POST(req: Request) {
  try {
    const ipHash = hashIp(clientIp(req));

    // Peek only. A budget spent by *successful* logins locks you out of your
    // own dashboard after a few normal sign-ins; only failures should count.
    const rate = await checkRateLimit({
      ...rateLimits.login,
      ipHash,
      record: false,
    });

    if (!rate.ok) {
      return NextResponse.json(
        { message: "Too many sign-in attempts. Please try again later." },
        {
          status: 429,
          headers: { "retry-after": String(rate.retryAfterSeconds ?? 900) },
        },
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    /** Record a failed attempt, then answer with the same message either way. */
    const fail = async () => {
      await checkRateLimit({ ...rateLimits.login, ipHash, record: true });
      return NextResponse.json({ message: GENERIC_FAILURE }, { status: 401 });
    };

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return fail();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return fail();

    // Signing in proves this caller is not the one being throttled.
    await clearRateLimit(rateLimits.login.scope, ipHash);

    const token = signToken({ id: String(user._id), email: user.email });

    // Set the httpOnly cookie the middleware checks (fixes dashboard access).
    const res = NextResponse.json({ message: "Login success" });
    res.cookies.set(authCookieName, token, {
      ...cookieOptions,
      maxAge: authCookieMaxAge,
    });
    return res;
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
