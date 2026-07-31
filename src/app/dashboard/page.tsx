"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  User,
  FolderKanban,
  FileText,
  Mail,
  Share2,
  Search,
  Settings,
  ExternalLink,
  LogOut,
  Inbox,
  Layers,
} from "lucide-react";

interface Stats {
  email: string;
  unread: number;
  totalMessages: number;
  projects: number;
}

const editors = [
  { title: "Hero", href: "/dashboard/hero", icon: Sparkles, desc: "Landing headline & roles" },
  { title: "About", href: "/dashboard/about", icon: User, desc: "Profile, experience, skills" },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanban, desc: "Work & case studies" },
  { title: "Resume", href: "/dashboard/resume", icon: FileText, desc: "Resume details & files" },
  { title: "Messages", href: "/dashboard/messages", icon: Mail, desc: "Contact submissions" },
  { title: "Social Links", href: "/dashboard/social", icon: Share2, desc: "GitHub, LinkedIn…" },
  { title: "SEO", href: "/dashboard/seo", icon: Search, desc: "Metadata & sharing" },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, desc: "Admin credentials" },
];

async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  window.location.href = "/";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ email: "", unread: 0, totalMessages: 0, projects: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [me, msgs, projects] = await Promise.all([
          fetch("/api/me", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/admin/messages", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/admin/content/projects", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        ]);
        setStats({
          email: me?.user?.email ?? "",
          unread: msgs?.unread ?? 0,
          totalMessages: Array.isArray(msgs?.messages) ? msgs.messages.length : 0,
          projects: Array.isArray(projects?.data) ? projects.data.length : 0,
        });
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  return (
    <div>
      {/* header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-cyan-300">Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Welcome back{stats.email ? <>, <span className="text-zinc-200">{stats.email}</span></> : " Admin"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm text-cyan-200 transition-colors hover:bg-cyan-400/10"
          >
            <ExternalLink size={16} /> View live site
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/20"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Inbox size={20} />} label="Unread messages" value={stats.unread} accent />
        <StatCard icon={<Mail size={20} />} label="Total messages" value={stats.totalMessages} />
        <StatCard icon={<FolderKanban size={20} />} label="Projects" value={stats.projects} />
        <StatCard icon={<Layers size={20} />} label="Editable sections" value={editors.length} />
      </div>

      {/* quick edit */}
      <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Manage content
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {editors.map((e) => {
          const Icon = e.icon;
          return (
            <Link
              key={e.href}
              href={e.href}
              className="group flex items-center gap-4 rounded-2xl border border-cyan-500/10 bg-white/5 p-5 transition-all hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.07]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-white">{e.title}</span>
                <span className="block truncate text-sm text-zinc-500">{e.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 rounded-2xl border border-cyan-500/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
        Tip: on the live site, use the <span className="text-cyan-300">Admin / Public</span> switch in
        the navbar to preview your portfolio exactly as visitors see it, and the floating{" "}
        <span className="text-cyan-300">Edit this page</span> button to jump straight to the right form.
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent && value > 0
          ? "border-cyan-400/30 bg-cyan-400/[0.06]"
          : "border-cyan-500/10 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          {icon}
        </span>
        <span className="text-3xl font-black text-white">{value}</span>
      </div>
      <div className="mt-3 text-sm text-zinc-400">{label}</div>
    </div>
  );
}
