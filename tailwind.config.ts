import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        navy: "#1B2A4A",
        blue: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        teal: "#0D9488",
        orange: "#EA580C",
        slate: {
          DEFAULT: "#64748B",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },

        // Risk score colors
        risk: {
          low: "#16A34A",
          moderate: "#D97706",
          high: "#DC2626",
          critical: "#7F1D1D",
        },

        // Violation severity border colors
        severity: {
          critical: "#DC2626",
          serious: "#EA580C",
          moderate: "#D97706",
          minor: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      fontSize: {
        "risk-score": ["8rem", { lineHeight: "1", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
export default config;
