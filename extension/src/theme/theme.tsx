export const themes = {
  light: {
    primary: "#007bff",
    background: "#ffffff",
    text: "#333333",
  },
  dark: {
    primary: "#007bff",
    background: "#333333",
    text: "#ffffff",
  },
} as const;

export type ThemeType = typeof themes;
