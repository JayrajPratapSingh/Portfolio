import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { z } from "zod";

import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import { buildCorpus, SYSTEM_INSTRUCTIONS } from "@/lib/chat/corpus";
import {
  checkRateLimit,
  clientIp,
  hashIp,
  limits,
} from "@/lib/chat/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chat — the site assistant.
 *
 * Runs on the Gemini free tier: no billing relationship, no card, and ample
 * headroom for a portfolio's traffic. The key stays server-side; the browser
 * only ever talks to this route. Responses stream back as newline-delimited
 * JSON so the client renders tokens as they arrive and still gets a structured
 * final frame.
 *
 * Only this file is provider-specific. The corpus, citations, rate limiting,
 * transcript storage and UI are all provider-agnostic, so moving to a
 * different model later means rewriting this file and nothing else.
 */

/**
 * Chosen for its free-tier daily quota, not its benchmark scores.
 *
 * `gemini-3.7-flash` answers better, but its free tier allows only **20
 * requests per day across the whole project** — that is the entire site's
 * budget, not per visitor, so a single curious afternoon would exhaust it.
 * The flash-lite tier is built for exactly this kind of high-volume free use.
 *
 * Alternatives, all confirmed available on this key: `gemini-3.1-flash-lite`,
 * `gemini-3.6-flash`, `gemini-3.7-flash`. Check your real quotas at
 * https://aistudio.google.com/rate-limit before changing this.
 *
 * Do **not** use `gemini-2.5-flash` — it returns 404 for new API keys.
 */
const MODEL = "gemini-3.5-flash-lite";

const BodySchema = z.object({
  sessionId: z.string().min(8).max(64),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(limits.MAX_MESSAGE_CHARS),
      }),
    )
    .min(1)
    .max(limits.MAX_TURNS),
});

/** Cached per warm process — rebuilt on cold start, so dashboard edits land. */
let corpusCache: { text: string; at: number } | null = null;
const CORPUS_TTL_MS = 5 * 60 * 1000;

async function getCorpus(): Promise<string> {
  if (corpusCache && Date.now() - corpusCache.at < CORPUS_TTL_MS) {
    return corpusCache.text;
  }
  const text = await buildCorpus();
  corpusCache = { text, at: Date.now() };
  return text;
}

function line(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(req: NextRequest) {
  // Order matters: reject malformed input before touching the database, and
  // rate-limit before doing anything expensive. The config check comes last so
  // an unconfigured deployment still can't be used as a free DB write loop.
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));
  const rate = await checkRateLimit(ipHash);

  if (!rate.ok) {
    return Response.json(
      {
        message:
          "You've reached the message limit for this hour. The contact form at /hire-me always works.",
      },
      {
        status: 429,
        headers: { "retry-after": String(rate.retryAfterSeconds ?? 3600) },
      },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { message: "The assistant is not configured (missing GEMINI_API_KEY)." },
      { status: 503 },
    );
  }

  const corpus = await getCorpus();
  const ai = new GoogleGenAI({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      let usage: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        cachedContentTokenCount?: number;
      } = {};

      try {
        const result = await ai.models.generateContentStream({
          model: MODEL,
          config: {
            // Instructions + corpus are one stable block. Gemini caches long
            // repeated prefixes implicitly, so keeping it byte-identical
            // between requests is what makes that possible.
            systemInstruction: `${SYSTEM_INSTRUCTIONS}\n\n---\n\n# Reference material\n\n${corpus}`,
            maxOutputTokens: 1200,
          },
          // Gemini names the assistant role "model", not "assistant".
          contents: body.messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        });

        for await (const chunk of result) {
          if (chunk.usageMetadata) usage = chunk.usageMetadata;
          const text = chunk.text;
          if (text) {
            answer += text;
            controller.enqueue(line({ type: "delta", text }));
          }
        }

        if (!answer.trim()) {
          // Safety filters and empty candidates both land here.
          answer =
            "I can't answer that one. If it's about my work, the contact form at /hire-me reaches me directly.";
          controller.enqueue(line({ type: "delta", text: answer }));
        }

        controller.enqueue(line({ type: "done" }));

        // Persist after the stream is served, so logging never delays a reply.
        void persist(body.sessionId, ipHash, body.messages, answer, usage);
      } catch (err) {
        console.error("[chat] stream failed:", err);
        controller.enqueue(
          line({
            type: "error",
            message:
              "Something went wrong reaching the assistant. Try again, or use the contact form at /hire-me.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-ratelimit-remaining": String(rate.remaining),
    },
  });
}

type Usage = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  cachedContentTokenCount?: number;
};

/** Append this turn to the stored transcript. Never throws into the response. */
async function persist(
  sessionId: string,
  ipHash: string | null,
  incoming: { role: "user" | "assistant"; content: string }[],
  answer: string,
  usage: Usage,
) {
  try {
    await dbConnect();

    const lastUser = [...incoming].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    // The assistant is told to point at /hire-me when the corpus falls short,
    // so that phrase is a usable signal for "content gap" in the dashboard.
    const unanswered = /\/hire-me/.test(answer) && /don'?t|not|no |haven'?t/i.test(answer);

    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: { sessionId, ipHash },
        $push: {
          messages: {
            $each: [
              { role: "user", content: lastUser.content },
              { role: "assistant", content: answer },
            ],
          },
        },
        $inc: {
          "usage.inputTokens": usage.promptTokenCount ?? 0,
          "usage.outputTokens": usage.candidatesTokenCount ?? 0,
          "usage.cacheReadTokens": usage.cachedContentTokenCount ?? 0,
        },
        $set: { unanswered },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error("[chat] persist failed:", err);
  }
}
