"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Unknown Digital University — campus top navigation (Phase DU-1A).
 *
 * The black command bar that frames every campus route. Bold wordmark (an
 * inspired-not-copied chevron mark for "step into the Unknown"), yellow active
 * underline. Client component only because it reads the active path.
 */

const NAV_ITEMS: { href: string; label: string; match: (p: string) => boolean }[] =
  [
    { href: "/campus", label: "Campus", match: (p) => p === "/campus" },
    { href: "/program", label: "Program", match: (p) => p.startsWith("/program") },
    {
      href: "/module/effectuation",
      label: "Module",
      match: (p) => p.startsWith("/module"),
    },
    {
      href: "/module/effectuation/studio",
      label: "Studio",
      match: (p) => p.startsWith("/module/effectuation/studio"),
    },
    { href: "/mentor", label: "Mentor", match: (p) => p.startsWith("/mentor") },
    { href: "/progress", label: "Progress", match: (p) => p.startsWith("/progress") },
  ];

export default function DuNav() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0B0C] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Link href="/campus" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center bg-[#F5D11E] text-[#0B0B0C]"
          >
            <span className="text-sm font-black leading-none">⌃</span>
          </span>
          <span className="text-sm font-black uppercase tracking-[0.22em]">
            Unknown
          </span>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 sm:inline">
            Digital University
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap border-b-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                  active
                    ? "border-[#F5D11E] text-white"
                    : "border-transparent text-white/55 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
