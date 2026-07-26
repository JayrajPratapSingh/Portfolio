"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { store, type RootState } from "@/store";
import { setTheme } from "@/store/slices/themeSlice";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.value);
  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme");
    if (saved === "light" || saved === "dark") dispatch(setTheme(saved));
  }, [dispatch]);
  useEffect(() => { document.documentElement.dataset.theme = theme; window.localStorage.setItem("portfolio-theme", theme); }, [theme]);
  return <>{children}</>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><ThemeSync>{children}</ThemeSync></Provider>;
}
