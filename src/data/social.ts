export type SocialKey = "github" | "linkedin" | "instagram";

export interface SocialLink {
  key: SocialKey;
  label: string;
  href: string;
}

/** Single source of truth for social links (Hero, Navbar, Footer). */
export const socials: SocialLink[] = [
  {
    key: "github",
    label: "GitHub",
    href: "https://github.com/JayrajPratapSingh",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jayraj-pratap-singh-457712193",
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ythjjps/",
  },
];
