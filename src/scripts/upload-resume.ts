/**
 * One-off: upload the generated ATS resume (PDF + DOCX) to Cloudinary and store
 * their URLs in the `resume` content section.
 * Usage: npx tsx src/scripts/upload-resume.ts "<dir-with-resume-files>"
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import path from "path";

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("Pass the directory containing the resume files.");

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const upload = (file: string) =>
    cloudinary.uploader.upload(file, {
      folder: "portfolio/resume",
      resource_type: "raw",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

  const pdf = await upload(path.join(dir, "Jayraj_Pratap_Singh_Resume.pdf"));
  const docx = await upload(path.join(dir, "Jayraj_Pratap_Singh_Resume.docx"));

  const { setContent } = await import("../lib/content");
  const { resume } = await import("../data/resume");
  const data = { ...resume, pdfUrl: pdf.secure_url, docxUrl: docx.secure_url };
  await setContent("resume", data);

  console.log("pdfUrl :", pdf.secure_url);
  console.log("docxUrl:", docx.secure_url);
  console.log("resume section saved.");
  process.exit(0);
}

main().catch((err) => {
  console.error("upload-resume failed:", err);
  process.exit(1);
});
