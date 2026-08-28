import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f6ff",
          100: "#e0edfe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36abf6",
          500: "#1e3a5f", // Royal Deep Blue
          600: "#162d4a",
          700: "#12243b",
          800: "#0e1a2c",
          900: "#09121f",
          950: "#050b14",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Rich Amber Gold
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        saudi: {
          green: "#006C35",
          gold: "#D4AF37",
          navy: "#1e3a5f",
          dark: "#0a1128"
        },
        surface: {
          light: "#ffffff",
          dark: "#0f172a",
          cardDark: "#1e293b",
          borderDark: "#334155"
        }
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "Tajawal", "system-ui", "sans-serif"],
        heading: ["var(--font-tajawal)", "Tajawal", "Cairo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-primary': '0 0 25px -5px rgba(30, 58, 95, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'islamic-pattern': "radial-gradient(#f59e0b 0.75px, transparent 0.75px), radial-gradient(#1e3a5f 0.75px, #f8fafc 0.75px)",
      }
    },
  },
  plugins: [],
};
export default config;
