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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        // One family everywhere — Helvetica Neue with native fallbacks. No
        // webfont fetch, no Inter, no serif. Weight and scale do the work.
        sans: [
          '"Helvetica Neue"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica",
          '"Segoe UI"',
          "Arial",
          "sans-serif",
        ],
        // Legacy alias — a few older classnames may still say font-serif;
        // they render the same grotesk stack.
        serif: [
          '"Helvetica Neue"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica",
          '"Segoe UI"',
          "Arial",
          "sans-serif",
        ],
        // Meta-data / dates / keystrokes.
        mono: [
          '"SF Mono"',
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
