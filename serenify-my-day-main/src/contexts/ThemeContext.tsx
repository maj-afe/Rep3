import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { THEME_PRESETS } from "@/components/ThemePicker";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  themePreset: string;
  setThemePreset: (preset: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = sessionStorage.getItem("blissy-theme");
    return (stored as Theme) || "light";
  });
  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    const stored = sessionStorage.getItem("blissy-theme-preset");
    return (stored as ThemePreset) || "mint";
  });

  useEffect(() => {
    document.documentElement.className = `theme-${themePreset}`;
    document.documentElement.classList.add(theme);
  }, [theme, themePreset]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      sessionStorage.setItem("blissy-theme", newTheme);
      setTheme(newTheme);
    },
    themePreset,
    setThemePreset: (newThemePreset: ThemePreset) => {
      sessionStorage.setItem("blissy-theme-preset", newThemePreset);
      setThemePreset(newThemePreset);
    },
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themePreset, setThemePreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
