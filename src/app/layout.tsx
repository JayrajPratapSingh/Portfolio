import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import ThemeProvider from "@/providers/ThemeProvider";
import { siteConfig } from "@/lib/constants";
import { getContent } from "@/lib/content";
import { seoDefault } from "@/lib/content-defaults";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata is generated from the editable `seo` content section (falling back
 * to the static defaults), so the SEO dashboard form drives the real head tags.
 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContent("seo", seoDefault);

  /**
   * The canonical origin comes from the environment only — deliberately not
   * from the editable `seo.url`.
   *
   * `seo.url` used to win here, and the value stored in MongoDB was still
   * `http://localhost:3000` from the original seed, so every canonical, OG URL
   * and sitemap entry advertised localhost. Worse, that made
   * NEXT_PUBLIC_SITE_URL unable to override it.
   *
   * A CMS field is the wrong home for this one value: it has to match where the
   * site is actually served from, which only the deployment knows. `siteConfig`
   * already resolves the env var with a localhost fallback, so both agree with
   * `sitemap.ts` and `robots.ts`. Everything else on the SEO form — title,
   * description, keywords, OG image — is still editable.
   */
  const base = siteConfig.url;

  return {
    metadataBase: new URL(base),
    title: {
      default: seo.title,
      template: `%s · ${siteConfig.shortName}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: siteConfig.name, url: base }],
    creator: siteConfig.name,
    applicationName: seo.title,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: base,
      siteName: seo.title,
      title: seo.title,
      description: seo.description,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    /**
     * No `icons` entry: Next discovers `app/icon.png` and `app/apple-icon.png`
     * by convention and emits the link tags with correct sizes and hashes. The
     * old hardcoded `/favicon.ico` pointed at the stock Next.js logo.
     *
     * `google` takes the Search Console verification token. Set
     * NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION and the tag appears; without it the
     * key is omitted rather than emitted empty.
     */
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  url: siteConfig.url,
  image: `${siteConfig.url}${siteConfig.ogImage}`,
  jobTitle: siteConfig.jobTitle,
  sameAs: [
    siteConfig.social.github,
    siteConfig.social.linkedin,
    siteConfig.social.instagram,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
