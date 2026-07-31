"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, MailOpen, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      const json = await res.json();
      setMessages(json.messages ?? []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (m: Message) => {
    setMessages((list) =>
      list.map((x) => (x._id === m._id ? { ...x, read: !x.read } : x)),
    );
    try {
      await fetch(`/api/admin/messages/${m._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !m.read }),
      });
    } catch {
      toast.error("Update failed");
      load();
    }
  };

  const remove = async (m: Message) => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    setMessages((list) => list.filter((x) => x._id !== m._id));
    try {
      const res = await fetch(`/api/admin/messages/${m._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
      load();
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-300">Messages</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Contact submissions from your portfolio.
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-cyan-400/15 px-2 py-0.5 text-xs text-cyan-300">
                {unread} unread
              </span>
            )}
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="animate-spin" size={18} /> Loading messages…
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-cyan-500/10 bg-white/5 p-16 text-center text-zinc-400">
          <Inbox size={40} className="text-zinc-600" />
          <p>No messages yet.</p>
          <p className="text-xs text-zinc-500">
            Submissions from the Hire Me page appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m._id}
              className={`rounded-3xl border p-6 backdrop-blur-xl transition-colors ${
                m.read
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-cyan-500/20 bg-cyan-500/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                    <span className="font-semibold text-white">{m.name}</span>
                    <a
                      href={`mailto:${m.email}`}
                      className="truncate text-sm text-cyan-300/80 hover:text-cyan-200"
                    >
                      {m.email}
                    </a>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {m.message}
                  </p>
                  <p className="mt-3 text-xs text-zinc-500">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleRead(m)}
                    title={m.read ? "Mark as unread" : "Mark as read"}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:bg-white/5"
                  >
                    {m.read ? <Mail size={16} /> : <MailOpen size={16} />}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    title="Delete"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
