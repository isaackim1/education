"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * AuthShell — the entrance into Ivvy. Same canvas and type as the app; auth is
 * not a separate brand. A centered 400px column on ivory.
 */
export default function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative isolate min-h-screen bg-[#FAF8F4]">
      <div className="ambient-wash" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 self-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#1E4634] text-sm font-medium text-white">
            I
          </span>
          <span className="text-[18px] font-medium tracking-[-0.01em] text-[#1A1A17]">
            Ivvy
          </span>
        </Link>

        <h1 className="mt-8 text-[24px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-[#56524B]">
            {description}
          </p>
        ) : null}

        <div className="mt-7">{children}</div>

        {footer ? (
          <div className="mt-6 text-sm text-[#56524B]">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
