"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Logo from "@/components/Floating/Logo";
import Preloader from "@/components/Preloader";
import EditPageFab from "@/components/layout/EditPageFab";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ThemeTransition from "@/components/layout/ThemeTransition";
import { cn } from "@/lib/cn";
import { isAdminArea } from "@/lib/edit-routes";

/**
 * Frames the app. Public pages get the marketing chrome (navbar, footer,
 * floating logo, edit shortcut); the dashboard and admin login render bare so
 * they own their full-screen experience — no double chrome.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = isAdminArea(pathname);

  return (
    <>
      <ThemeTransition />
      {!admin && <SmoothScroll />}
      {!admin && <Preloader />}
      {!admin && <Navbar />}

      <main className={cn("flex-1", !admin && "pt-20")}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </main>

      {!admin && (
        <>
          <Footer />
          <Logo />
          <EditPageFab />
        </>
      )}
    </>
  );
}
