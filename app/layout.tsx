import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Crimson Pro — an academic book serif used for display headings only. Loaded
// through next/font (part of Next.js, not a new dependency); self-hosted at
// build time with no runtime request.
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body
        className={`${inter.variable} ${crimsonPro.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
