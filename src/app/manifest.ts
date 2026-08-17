import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

/**
 * Web app manifest.
 *
 * Not for installability so much as for the icon and name Android/Chrome use
 * when the site is bookmarked or added to a home screen — without it they fall
 * back to a screenshot and the bare hostname.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#04010f",
    theme_color: "#04010f",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
