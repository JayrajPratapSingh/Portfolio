"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/Preloader";
import EditPageFab from "@/components/layout/EditPageFab";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ThemeTransition from "@/components/layout/ThemeTransition";
import HoneyCursor from "@/components/layout/HoneyCursor";
import { cn } from "@/lib/cn";
import { isAdminArea } from "@/lib/edit-routes";

// Chat is opt-in by click, so its code shouldn't be in the initial bundle.
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), {
  ssr: false,
});

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
      <HoneyCursor />
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
          <EditPageFab />
          {/* Occupies the bottom-right slot the floating logo used to hold.
              Back-to-top still lives in the footer. */}
          <ChatWidget />
        </>
      )}
    </>
  );
}
