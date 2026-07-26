"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Login", href: "/admin/login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="nav-brand">
          <Image
            src="/images/logo.png"
            alt="Jayraj Pratap Singh"
            width={34}
            height={34}
            priority
          />
          <span>
            JPS<span className="nav-brand-dot">.</span>LAB
          </span>
        </Link>
       
        <div className="nav-actions">
           <div className="nav-links">
           {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "is-active" : ""}
            >
              {link.label}
            </Link>
          ))}
          </div>
          <ThemeToggle />
          <Link href="/hire-me" className="nav-cta">
            Hire Me <ArrowUpRight size={15} />
          </Link>
          <button
            className="nav-menu"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="nav-drawer">
            {links.map((link) => (
              <Link
                onClick={() => setOpen(false)}
                key={link.href}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <Link onClick={() => setOpen(false)} href="/hire-me">
              Hire Me
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
