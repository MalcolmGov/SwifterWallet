import React, { createContext, useContext, useState, ReactNode } from "react";
import { Colors } from "../constants/theme";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof Colors.dark;
  toggle: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  colors: Colors.dark,
  toggle: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const colors = Colors[mode];
  const isDark = mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
