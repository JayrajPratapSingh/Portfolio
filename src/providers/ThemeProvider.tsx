"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * App-wide theme provider.
 *
 * - `attribute="class"`  -> toggles `class="dark"|"light"` on <html>, which the
 *   Tailwind `dark:` variant (see globals.css `@custom-variant`) keys off.
 * - `defaultTheme="dark"` + `enableSystem={false}` -> the signature cosmic dark
 *   experience is always the first impression; Light is an opt-in "new universe".
 * - `disableTransitionOnChange` -> no color-transition flash while toggling.
 */
export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
