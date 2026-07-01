import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";

// Newsreader — an editorial literary serif used for display headings, metrics,
// and pull quotes. Loaded through next/font (part of Next.js, not a new
// dependency); self-hosted at build time with no runtime request. The body /
// UI sans is a native SF Pro / Helvetica Neue stack defined in the Tailwind
// theme, so no web sans is fetched at all.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ivvy",
  description: "AI-powered exam training workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
