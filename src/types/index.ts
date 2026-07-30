/* ------------------------------------------------------------------ */
/*  Shared content types.                                             */
/*  Kept serializable (icons referenced by string key, resolved in the */
/*  UI) so this data can move behind an API / CMS later untouched.     */
/* ------------------------------------------------------------------ */

export type IconKey =
  | "server"
  | "cloud"
  | "database"
  | "boxes"
  | "activity"
  | "cpu"
  | "globe"
  | "arrowUpRight"
  | "download";

export interface HeroCTA {
  label: string;
  href: string;
  variant: "primary" | "ghost";
  icon?: IconKey;
  download?: boolean;
  external?: boolean;
}

export interface HeroFloatingCard {
  title: string;
  icon: IconKey;
  /** Tailwind position utilities placing the card around the hero. */
  position: string;
}

export interface HeroContent {
  name: string;
  /** Rotating role phrases for the type animation. */
  roles: string[];
  eyebrow: string;
  description: string;
  availability: {
    available: boolean;
    label: string;
  };
  techBadges: string[];
  ctas: HeroCTA[];
  status: {
    label: string;
    services: string[];
  };
  floatingCards: HeroFloatingCard[];
  /** Portrait used in both the cosmic (bg) and aurora (glass frame) heroes. */
  photo: string;
}
