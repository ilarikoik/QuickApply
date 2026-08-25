import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { themes, type ThemeType } from "./theme";

type ThemeName = keyof ThemeType;

interface ThemeContextValue {
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  // Tämä ajetaan aina kun themeName muuttuu.
  // Se kirjoittaa värit suoraan <html>-elementin styleen CSS-muuttujina.
  useEffect(() => {
    const root = document.documentElement;
    const t = themes[themeName];
    root.style.setProperty("--color-primary", t.primary);
    root.style.setProperty("--color-background", t.background);
    root.style.setProperty("--color-text", t.text);
  }, [themeName]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      toggleTheme: () =>
        setThemeName((prev) => (prev === "light" ? "dark" : "light")),
      setTheme: setThemeName,
    }),
    [themeName],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme käyttö ThemeProviderin sisällä");
  return ctx;
}
