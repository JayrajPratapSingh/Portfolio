import mongoose from "mongoose";

/**
 * Chat transcripts from the site assistant.
 *
 * Stored so the dashboard can show what visitors actually ask — which is the
 * genuinely useful output of a portfolio chatbot. `ipHash` is a salted hash,
 * never the address itself: enough to group a conversation and rate-limit it,
 * not enough to identify anyone.
 */
const ConversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    ipHash: { type: String, index: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    /** Cumulative token spend, so cost is visible per conversation. */
    usage: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      cacheReadTokens: { type: Number, default: 0 },
      cacheWriteTokens: { type: Number, default: 0 },
    },
    /** Set when the assistant declined for lack of grounding — the gap list. */
    unanswered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);

export default Conversation;
