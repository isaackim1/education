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
        // Native geometric sans — SF Pro / Helvetica Neue. No Inter, no web
        // fetch. (minimalist-ui: banned Inter/Roboto/Open Sans.)
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Helvetica Neue"',
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
        // Editorial display serif — Newsreader via next/font.
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "Cambria", "serif"],
        // Meta-data / keystrokes.
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
