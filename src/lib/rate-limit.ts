import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";

/**
 * Per-IP sliding-window rate limiter backed by MongoDB, shared by every public
 * endpoint that costs something to run: the chat (API spend), the contact form
 * (outbound email), and login (password guesses).
 *
 * MongoDB rather than an in-memory counter because the cap has to survive a
 * restart and hold across instances. Documents expire via a TTL index, so the
 * collection cleans up after itself.
 */

const HitSchema = new mongoose.Schema({
  /** Which endpoint the hit belongs to, so buckets never bleed into each other. */
  scope: { type: String, required: true },
  ipHash: { type: String, required: true },
  at: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
});

HitSchema.index({ scope: 1, ipHash: 1, at: 1 });

const RateHit =
  mongoose.models.RateHit || mongoose.model("RateHit", HitSchema);

/**
 * Hash the address with a server-side secret. Storing raw IPs would make this a
 * log of who visited; a keyed hash still groups requests without doing that.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.JWT_SECRET ?? "portfolio";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/**
 * Best-effort client address behind Vercel / a proxy.
 *
 * Returns null rather than a constant when the address can't be determined —
 * bucketing every unidentifiable caller under one shared key means the first
 * few attempts lock out everyone else, which is what happens on a local server
 * where no proxy headers are set at all.
 */
export function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  /**
   * True when the durable limiter could not run and this verdict came from the
   * in-process fallback instead. The request was still counted — just not in a
   * way that survives a restart or is shared across instances.
   */
  degraded?: boolean;
}

/**
 * In-process fallback used when MongoDB is unreachable.
 *
 * Weaker than the durable limiter — per-instance, and it resets on restart — but
 * the alternative is refusing every request during a database blip, and this
 * project's database is a free-tier cluster that auto-pauses. A cap that is
 * merely per-instance still stops the abuse this guards against; no cap at all
 * would not.
 */
const memoryHits = new Map<string, number[]>();

function memoryCheck({
  scope,
  ipHash,
  max,
  windowMs,
  record = true,
}: RateLimitOptions): RateLimitResult {
  const key = `${scope}:${ipHash}`;
  const now = Date.now();

  // Keep the map from growing without bound across many distinct addresses.
  if (memoryHits.size > 5000) memoryHits.clear();

  const recent = (memoryHits.get(key) ?? []).filter((t) => t > now - windowMs);

  if (recent.length >= max) {
    const resetsAt = recent[0]! + windowMs;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((resetsAt - now) / 1000)),
      degraded: true,
    };
  }

  if (record) {
    recent.push(now);
    memoryHits.set(key, recent);
  }
  return { ok: true, remaining: max - recent.length, degraded: true };
}

/** Drop a caller's recorded attempts — used after a successful sign-in. */
export async function clearRateLimit(scope: string, ipHash: string | null) {
  if (!ipHash) return;
  memoryHits.delete(`${scope}:${ipHash}`);
  try {
    await dbConnect();
    await RateHit.deleteMany({ scope, ipHash });
  } catch {
    // The in-process copy is already cleared; a failure here is not worth
    // failing a successful login over.
  }
}

export interface RateLimitOptions {
  scope: string;
  /** Null when the caller could not be identified — see `clientIp`. */
  ipHash: string | null;
  max: number;
  windowMs: number;
  /**
   * When false, report whether the caller is over the limit without counting
   * this request against them.
   *
   * Login uses this so only *failed* attempts consume the budget. Counting
   * successes too means signing in a few times legitimately locks you out of
   * your own dashboard.
   */
  record?: boolean;
}

/**
 * Never throws — a caller that can't reach the database still needs an answer.
 *
 * On a database outage this falls back to an in-process counter rather than
 * refusing outright. Refusing was the first design, but it meant a paused
 * free-tier cluster took the whole assistant offline, and the thing being
 * protected here is a free-tier quota rather than a bill. Callers that guard
 * something genuinely dangerous — the contact form's auto-reply to a
 * sender-supplied address — check `degraded` and hold that part back.
 */
export async function checkRateLimit({
  scope,
  ipHash,
  max,
  windowMs,
  record = true,
}: RateLimitOptions): Promise<RateLimitResult> {
  // Unidentifiable caller: don't invent a shared bucket for them. Doing that
  // makes one visitor's attempts count against everyone else's.
  if (!ipHash) return { ok: true, remaining: max, degraded: true };

  try {
    await dbConnect();

    const since = new Date(Date.now() - windowMs);
    const used = await RateHit.countDocuments({ scope, ipHash, at: { $gte: since } });

    if (used >= max) {
      const oldest = await RateHit.findOne({ scope, ipHash, at: { $gte: since } })
        .sort({ at: 1 })
        .lean<{ at: Date } | null>();

      const resetsAt = (oldest?.at.getTime() ?? Date.now()) + windowMs;
      return {
        ok: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((resetsAt - Date.now()) / 1000)),
      };
    }

    if (record) await RateHit.create({ scope, ipHash });
    return { ok: true, remaining: max - used - (record ? 1 : 0) };
  } catch (err) {
    console.error(
      `[rate-limit] durable store unavailable for "${scope}", using in-process fallback:`,
      err,
    );
    return memoryCheck({ scope, ipHash, max, windowMs });
  }
}

/** Caps per endpoint, in one place so they're easy to compare and tune. */
export const rateLimits = {
  chat: { scope: "chat", max: 8, windowMs: 60 * 60 * 1000 },
  /**
   * Deliberately tight: this endpoint emails an address the *sender* supplies,
   * so an uncapped version is an open relay. Three per hour keeps the feature
   * usable for a real visitor while making it worthless for abuse.
   */
  contact: { scope: "contact", max: 3, windowMs: 60 * 60 * 1000 },
  login: { scope: "login", max: 6, windowMs: 15 * 60 * 1000 },
} as const;
