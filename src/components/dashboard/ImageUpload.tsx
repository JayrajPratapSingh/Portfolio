"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Admin image uploader — sends the picked file to `/api/admin/upload` (→
 * Cloudinary) and reports back the secure URL. Shows a live preview and lets
 * the admin clear the current image.
 */
export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
}: {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading image…");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      toast.dismiss(toastId);
      if (!res.ok) throw new Error(json.message || "Upload failed");
      onChange(json.url, json.publicId);
      toast.success("Image uploaded");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {value ? (
        <div className="group relative aspect-video w-full max-w-xs overflow-hidden rounded-2xl border border-white/10">
          <Image src={value} alt="preview" fill sizes="320px" className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={pick}
              disabled={uploading}
              className="btn-3d rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-cyan-300"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="btn-3d grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/20"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="flex aspect-video w-full max-w-xs flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 text-zinc-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <UploadCloud size={22} /> <span className="text-sm">Click to upload</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
