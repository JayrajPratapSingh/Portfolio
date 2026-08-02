"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud, FileText, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

/**
 * Admin document uploader — sends a file (pdf/doc/docx) to `/api/admin/upload`
 * (→ Cloudinary raw) and reports the URL back. Shows the current file with a
 * link + clear/replace controls.
 */
export default function FileUpload({
  value,
  onChange,
  folder = "resume",
  accept = ".pdf,.doc,.docx",
  label = "File",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading file…");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      toast.dismiss(toastId);
      if (!res.ok) throw new Error(json.message || "Upload failed");
      onChange(json.url);
      toast.success("File uploaded");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fileName = value ? decodeURIComponent(value.split("/").pop() || "file") : "";

  return (
    <div>
      <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>
      <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="hidden" />

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <FileText size={16} className="shrink-0" />
            <span className="truncate">{fileName}</span>
            <ExternalLink size={13} className="shrink-0 opacity-70" />
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={uploading}
              className="btn-3d rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-cyan-300 disabled:opacity-60"
            >
              {uploading ? "…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 py-4 text-sm text-zinc-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <UploadCloud size={18} /> Click to upload
            </>
          )}
        </button>
      )}
    </div>
  );
}
