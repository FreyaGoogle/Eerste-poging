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
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        zwaar: {
          50: "#fefce8",
          200: "#fef08a",
          600: "#ca8a04",
          700: "#a16207",
        },
        success: {
          50: "#f0fdf4",
          600: "#16a34a",
        },
        danger: {
          50: "#fef2f2",
          600: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
export default config;
