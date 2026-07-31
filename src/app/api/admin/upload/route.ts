import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { getAuthUser } from "@/lib/auth";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const RAW_RE = /\.(pdf|docx?|txt|rtf)$/i;

/**
 * POST /api/admin/upload — admin-only. Accepts a multipart `file` (+ optional
 * `folder`) and uploads it to Cloudinary. Images upload as `image`; documents
 * (pdf/doc/docx/txt) upload as `raw`. Returns the secure URL + public id.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { message: "Cloudinary is not configured (check CLOUDINARY_* env vars)." },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "File too large (max 10 MB)" }, { status: 413 });
  }

  const folder = `portfolio/${(form.get("folder") as string) || "uploads"}`;
  const isRaw = RAW_RE.test(file.name) || /pdf|word|officedocument|text/.test(file.type);
  const resourceType: "image" | "raw" = isRaw ? "raw" : "image";

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (err, res) => (err || !res ? reject(err) : resolve(res)),
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      bytes: result.bytes,
      format: result.format,
      originalName: file.name,
    });
  } catch (err) {
    console.error("[upload] cloudinary failed:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 502 });
  }
}
