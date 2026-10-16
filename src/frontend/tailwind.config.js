import containerQueries from "@tailwindcss/container-queries";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        /* semantic tokens (design wave) */
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "oklch(var(--success))",
          foreground: "oklch(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "oklch(var(--warning))",
          foreground: "oklch(var(--warning-foreground))",
        },
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        /* legacy aliases kept for existing classes */
        cream: "oklch(var(--background))",
        sand: "oklch(var(--secondary))",
        espresso: "oklch(var(--foreground))",
        cocoa: "oklch(var(--muted-foreground))",
        clay: "oklch(var(--primary))",
        "clay-dark": "oklch(var(--primary))",
      },
      boxShadow: {
        "subtle": "0 1px 2px 0 oklch(0.215 0.032 52 / 0.05), 0 1px 3px 0 oklch(0.215 0.032 52 / 0.06)",
        "card": "0 2px 4px -1px oklch(0.215 0.032 52 / 0.06), 0 8px 20px -6px oklch(0.215 0.032 52 / 0.10)",
        "elevated": "0 4px 8px -2px oklch(0.215 0.032 52 / 0.08), 0 16px 40px -12px oklch(0.215 0.032 52 / 0.16)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "steam": {
          "0%, 100%": { opacity: "0.25", transform: "translateY(0) scaleX(1)" },
          "50%": { opacity: "0.5", transform: "translateY(-6px) scaleX(1.06)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "steam": "steam 4s ease-in-out infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
