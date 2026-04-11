export const Colors = {
  dark: {
    background: "#0a0a0f",
    card: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(255,255,255,0.06)",
    glass: "rgba(255,255,255,0.06)",
    glassBorder: "rgba(255,255,255,0.08)",
    text: "#ffffff",
    textMuted: "#9ca3af",
    textSoft: "#6b7280",
    divider: "rgba(255,255,255,0.06)",
    violet: "#7c3aed",
    emerald: "#10b981",
    amber: "#f59e0b",
  },
  light: {
    background: "#f9fafb",
    card: "#ffffff",
    cardBorder: "#f3f4f6",
    glass: "rgba(255,255,255,0.8)",
    glassBorder: "rgba(229,231,235,0.6)",
    text: "#111827",
    textMuted: "#6b7280",
    textSoft: "#9ca3af",
    divider: "#f3f4f6",
    violet: "#7c3aed",
    emerald: "#10b981",
    amber: "#f59e0b",
  },
};

export type GradientTuple = readonly [string, string, ...string[]];

export const Gradients: Record<string, GradientTuple> = {
  violet: ["#7c3aed", "#4338ca"],
  emerald: ["#10b981", "#0d9488"],
  amber: ["#f59e0b", "#ea580c"],
  blue: ["#3b82f6", "#2563eb"],
  pink: ["#ec4899", "#db2777"],
};

export const WalletColors: Record<string, GradientTuple> = {
  MAIN: Gradients.violet,
  SAVINGS: Gradients.emerald,
  BUSINESS: Gradients.amber,
  CUSTOM: Gradients.blue,
};
