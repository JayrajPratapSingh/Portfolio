import { Schema, model, models } from "mongoose";

const ContentEntrySchema = new Schema(
  {
    contentType: { type: String, required: true, index: true, trim: true },
    slug: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
    data: { type: Schema.Types.Mixed, required: true, default: {} },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ContentEntrySchema.index({ contentType: 1, slug: 1 }, { unique: true });

const ContentEntry = models.ContentEntry || model("ContentEntry", ContentEntrySchema);

export default ContentEntry;
