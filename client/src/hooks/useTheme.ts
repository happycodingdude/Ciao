import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// Nguồn chân lý ban đầu: localStorage → data-theme (đã set bởi inline script chống flash) → "light".
const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
};

const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Side-effect deterministic: phản chiếu state ra DOM + persist.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
};

export default useTheme;
