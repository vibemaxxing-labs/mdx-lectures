import { useCallback, useEffect, useState } from "react";

export type ThemeScheme = "light" | "dark";

export const themeStorageKey = "md-slides-theme";

function isThemeScheme(value: string | null): value is ThemeScheme {
  return value === "light" || value === "dark";
}

function getStoredThemeScheme(): ThemeScheme | null {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    return isThemeScheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function getPreferredThemeScheme(): ThemeScheme {
  const storedTheme = getStoredThemeScheme();
  if (storedTheme) return storedTheme;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function persistThemeScheme(theme: ThemeScheme) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme switching should still work when storage is unavailable.
  }
}

export function useThemeScheme() {
  const [theme, setTheme] = useState<ThemeScheme>(getPreferredThemeScheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persistThemeScheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }, []);

  return {
    theme,
    toggleTheme
  };
}
