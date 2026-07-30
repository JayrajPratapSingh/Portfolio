import mongoose from "mongoose";

/**
 * Flexible content store — one document per page/section (`hero`, `about`,
 * `projects`, `social`, `seo`, …). `data` holds arbitrary JSON (object or
 * array), so new sections need no schema change.
 */
const ContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, minimize: false },
);

const Content =
  mongoose.models.Content || mongoose.model("Content", ContentSchema);

export default Content;
