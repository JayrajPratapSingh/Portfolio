import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary client configured from env. Used by the admin upload route to
 * store project images and the resume (DOCX/PDF). Server-only — never import
 * into a client component (it carries the API secret).
 *
 * If `CLOUDINARY_URL` is set (cloudinary://<key>:<secret>@<cloud_name>) the SDK
 * reads it automatically — that's the simplest single-value setup. Otherwise we
 * configure from the individual CLOUDINARY_* vars.
 */
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  // Explicit vars — guaranteed regardless of import/env timing.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  // Fall back to CLOUDINARY_URL (cloudinary://key:secret@cloud), parsed by SDK.
  cloudinary.config({ secure: true });
}

export function isCloudinaryConfigured() {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export default cloudinary;
