import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-public-sans)"],
      },
      colors: {
        transparent: "transparent",
        "light-5": "rgba(255,255,255,0.05)",
        "light-8": "rgba(255,255,255,0.08)",
        "light-16": "rgba(255,255,255,0.16)",
        "light-10": "rgba(255,255,255,0.10)",
        "light-20": "rgba(255,255,255,0.20)",
        "light-60": "rgba(255,255,255,0.60)",
        "light-80": "rgba(255,255,255,0.80)",
        light: "#FFFFFF",
        dark: "#000000",
        "dark-90": "rgba(0,0,0,0.90)",
        "bg-layer-1": "#0f0f0f",
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
};
export default config;
