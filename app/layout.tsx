import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivvy",
  description:
    "Upload your exam materials. Ivvy turns them into a personal coach that trains you, remembers your mistakes, and tells you what to study next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
