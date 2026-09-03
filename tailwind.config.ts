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
          50: "#f3f4fd",
          100: "#e5e8fb",
          200: "#d0d5f9",
          300: "#aab5f5",
          400: "#7c8bee",
          500: "#4f5de4", // tiqdr base indigo blue
          600: "#3d49cb",
          700: "#3139a5",
          800: "#2a2f85",
          900: "#262b6d",
          950: "#171a43",
        },
        secondary: {
          50: "#fff7ed",
          100: "#ffeed5",
          200: "#fed7aa",
          300: "#fdb974",
          400: "#fb923c",
          500: "#f57005", // tiqdr vibrant orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        tiqdr: {
          base: "#4F5DE4",
          secondary: "#F57005",
          black: "#2A254D",
          text: "#697585",
          text2: "#B3ADE1",
          soft: "#F1F2FD",
          soft2: "#F6F5F5",
          soft3: "#E0E3FD",
          soft4: "#E4E4E4",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f57005", // map gold to tiqdr vibrant secondary
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        saudi: {
          green: "#006C35",
          gold: "#F57005",
          navy: "#2A254D",
          dark: "#1A1736"
        },
        surface: {
          light: "#ffffff",
          dark: "#1A1736",
          cardDark: "#242045",
          borderDark: "#373261"
        }
      },
      fontFamily: {
        sans: ["var(--font-noto-kufi)", "Noto Kufi Arabic", "Cairo", "system-ui", "sans-serif"],
        heading: ["var(--font-noto-kufi)", "Noto Kufi Arabic", "Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(245, 112, 5, 0.25)',
        'glow-primary': '0 0 25px -5px rgba(79, 93, 228, 0.35)',
        'tiqdr': '0 10px 30px 0 rgba(79, 93, 228, 0.08)',
        'tiqdr-hover': '0 15px 35px 0 rgba(79, 93, 228, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
export default config;
