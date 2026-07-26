"use client";

import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { toggleTheme } from "@/store/slices/themeSlice";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.value);
  return <button type="button" onClick={() => dispatch(toggleTheme())} aria-label="Toggle color theme" className="theme-toggle">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>;
}
