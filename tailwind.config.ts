import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde6fd",
          200: "#c3d0fb",
          300: "#9ab0f8",
          400: "#6b87f3",
          500: "#4560ec",
          600: "#2f42e0",
          700: "#2632cc",
          800: "#252ba6",
          900: "#242a83",
          950: "#161953",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
