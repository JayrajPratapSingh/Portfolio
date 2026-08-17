import {
  checkRateLimit as check,
  clientIp,
  hashIp,
  rateLimits,
  type RateLimitResult,
} from "@/lib/rate-limit";

/**
 * Chat-specific wrapper over the shared limiter in `@/lib/rate-limit`.
 *
 * The provider's free tier caps *requests per day for the whole project* — not
 * per visitor — so this per-IP cap exists to stop one person consuming the
 * site's entire daily allowance in a single sitting.
 */

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 30; // per conversation, so one session can't run forever

export { clientIp, hashIp };
export type { RateLimitResult };

export function checkRateLimit(ipHash: string | null): Promise<RateLimitResult> {
  return check({ ...rateLimits.chat, ipHash });
}

export const limits = {
  WINDOW_MS: rateLimits.chat.windowMs,
  MAX_PER_WINDOW: rateLimits.chat.max,
  MAX_MESSAGE_CHARS,
  MAX_TURNS,
};
