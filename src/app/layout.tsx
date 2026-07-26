import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import Logo from "@/components/Floating/Logo";
import AppProviders from "@/providers/AppProviders";
import SmoothScroll from "@/components/experience/SmoothScroll";
import CursorBee from "@/components/experience/CursorBee";
import CinematicLoader from "@/components/layout/CinematicLoader";
export const metadata: Metadata = {
  title: "Jayraj Pratap Singh | Full Stack Engineer",
  description: "Full stack engineer crafting immersive, high-performance digital products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-screen flex flex-col bg-black text-white">

        <AppProviders>
        <CinematicLoader />
        <SmoothScroll />
        <Navbar />
        <main className="flex-1 pt-20">
          {children}
          <Toaster
          position="top-right"
          richColors
          closeButton
        />

        </main>

        <Footer />

        <Logo />
        <CursorBee />
        </AppProviders>

      </body>
    </html>
  );
}
