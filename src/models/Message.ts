import mongoose from "mongoose";

/**
 * Contact-form submissions from `/hire-me`. Stored so the admin can review them
 * in the dashboard even if email delivery fails.
 */
const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
