"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, MessageSquare, AlertCircle } from "lucide-react";

import { DashHeader, Section, Loading } from "@/components/dashboard/FormKit";
import { cn } from "@/lib/cn";

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

interface StoredConversation {
  _id: string;
  sessionId: string;
  messages: StoredMessage[];
  unanswered?: boolean;
  updatedAt: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
  };
}

/**
 * What visitors actually asked the site assistant.
 *
 * The "needs an answer" filter is the useful half: those are questions the
 * site's own content could not answer, which is a to-do list for the content
 * rather than a bug in the assistant.
 */
export default function ChatsDashboard() {
  const [rows, setRows] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [gapsOnly, setGapsOnly] = useState(false);

  // State updates all sit after an await, so nothing fires synchronously
  // during the effect body — same shape as `useContentSection`.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/chats${gapsOnly ? "?gaps=1" : ""}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        if (active) setRows(json.data ?? []);
      } catch {
        if (active) toast.error("Failed to load conversations");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [gapsOnly]);

  const remove = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    const res = await fetch(`/api/admin/chats?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((r) => r.filter((x) => x._id !== id));
      toast.success("Deleted");
    } else {
      toast.error("Delete failed");
    }
  };

  const totalTokens = rows.reduce(
    (sum, r) =>
      sum +
      (r.usage?.inputTokens ?? 0) +
      (r.usage?.outputTokens ?? 0) +
      (r.usage?.cacheReadTokens ?? 0),
    0,
  );

  if (loading) return <Loading label="Loading conversations…" />;

  return (
    <div className="max-w-4xl">
      <DashHeader
        title="Assistant chats"
        subtitle="What visitors asked the site assistant, and what it couldn't answer."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setGapsOnly((g) => !g);
          }}
          className={cn(
            "btn-3d inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
            gapsOnly
              ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
              : "border-white/10 text-zinc-300 hover:bg-white/5",
          )}
        >
          <AlertCircle size={15} />
          {gapsOnly ? "Showing gaps only" : "Show gaps only"}
        </button>

        <span className="text-xs text-zinc-500">
          {rows.length} conversation{rows.length === 1 ? "" : "s"} ·{" "}
          {totalTokens.toLocaleString()} tokens
        </span>
      </div>

      {rows.length === 0 ? (
        <Section title="Nothing yet">
          <p className="text-sm text-zinc-400">
            {gapsOnly
              ? "No unanswered questions — the site content is covering what people ask."
              : "No conversations yet. Once visitors use the assistant, their questions show up here."}
          </p>
        </Section>
      ) : (
        <div className="space-y-5">
          {rows.map((c) => (
            <Section
              key={c._id}
              title={new Date(c.updatedAt).toLocaleString()}
              action={
                <button
                  type="button"
                  onClick={() => remove(c._id)}
                  className="btn-3d inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={13} /> Delete
                </button>
              }
            >
              {c.unanswered && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
                  <AlertCircle size={14} />
                  The assistant fell back to the contact form — the site may be
                  missing content for this.
                </div>
              )}

              <div className="space-y-3">
                {c.messages.map((m, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 text-xs font-semibold uppercase tracking-wider",
                        m.role === "user" ? "text-cyan-300" : "text-zinc-500",
                      )}
                    >
                      {m.role === "user" ? "Q" : "A"}
                    </span>
                    <p
                      className={cn(
                        "leading-7",
                        m.role === "user" ? "text-zinc-100" : "text-zinc-400",
                      )}
                    >
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>

              {c.usage && (
                <p className="mt-4 border-t border-white/10 pt-3 text-xs text-zinc-600">
                  <MessageSquare size={12} className="mr-1.5 inline" />
                  {c.usage.inputTokens ?? 0} in · {c.usage.outputTokens ?? 0} out ·{" "}
                  {c.usage.cacheReadTokens ?? 0} cached
                </p>
              )}
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}
