import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names intelligently.
 * `clsx` resolves conditionals; `twMerge` de-dupes conflicting utilities
 * (e.g. `px-2 px-4` -> `px-4`). Use everywhere instead of raw template strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
