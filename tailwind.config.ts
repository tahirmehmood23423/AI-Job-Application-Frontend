import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0f172a",
        "navy-800": "#1e293b",
        bg: "#f1f5f9",
        surface: "#ffffff",
        border: "#e2e8f0",
        "border-strong": "#cbd5e1",
        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        "primary-light": "#eff6ff",
        "primary-border": "#bfdbfe",
        ink: "#1e293b",
        muted: "#64748b",
        "muted-light": "#94a3b8",
        success: "#16a34a",
        "success-light": "#f0fdf4",
        "success-border": "#bbf7d0",
        error: "#dc2626",
        "error-light": "#fef2f2",
        "error-border": "#fecaca",
        warning: "#d97706",
        "warning-light": "#fffbeb",
        "warning-border": "#fde68a",
        violet: "#7c3aed",
        "violet-light": "#f5f3ff",
        "violet-border": "#ddd6fe",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
