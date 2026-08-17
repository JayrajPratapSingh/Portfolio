"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Sparkles,
  User,
  FolderKanban,
  Share2,
  Search,
  Settings,
  LogOut,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Hero", href: "/dashboard/hero", icon: Sparkles },
  { title: "About", href: "/dashboard/about", icon: User },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { title: "Resume", href: "/dashboard/resume", icon: FileText },
  { title: "Messages", href: "/dashboard/messages", icon: Mail },
  { title: "Assistant chats", href: "/dashboard/chats", icon: MessageSquare },
  { title: "Social Links", href: "/dashboard/social", icon: Share2 },
  { title: "SEO", href: "/dashboard/seo", icon: Search },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

const handleLogout = async () => {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    /* ignore — redirect regardless */
  }
  localStorage.removeItem("token");
  window.location.href = "/admin/login";
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-cyan-500/10 bg-black/40 backdrop-blur-2xl">
      
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-cyan-500/10">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-widest text-cyan-300">
            PORTFOLIO CMS
          </h1>

          <p className="text-xs text-zinc-500">
            ADMIN PANEL
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-3
                  transition-all
                  duration-300
                  
                  ${
                    isActive
                      ? "bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                      : "border border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}