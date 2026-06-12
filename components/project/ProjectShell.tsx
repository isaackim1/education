"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * ProjectShell — the workspace layout for everything under /projects/[id].
 *
 * A fixed left sidebar (project navigation) on desktop, collapsing to a
 * horizontal scroll nav on small screens. The main content area uses the full
 * remaining width so project pages read like an application workspace rather
 * than a narrow centered column. Presentational only — no product logic.
 */

export type ProjectNavId =
  | "overview"
  | "setup"
  | "import"
  | "materials"
  | "study"
  | "train"
  | "chat"
  | "mistakes"
  | "review"
  | "goals"
  | "log";

type NavItem = { id: ProjectNavId; label: string; suffix: string };

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Workspace",
    items: [
      { id: "overview", label: "Overview", suffix: "" },
      { id: "setup", label: "Topics", suffix: "/setup" },
      { id: "import", label: "Import", suffix: "/import" },
      { id: "materials", label: "Materials", suffix: "/materials" },
    ],
  },
  {
    heading: "Study",
    items: [
      { id: "study", label: "Study", suffix: "/study" },
      { id: "train", label: "Train", suffix: "/train" },
      { id: "chat", label: "Chat", suffix: "/chat" },
    ],
  },
  {
    heading: "Progress",
    items: [
      { id: "mistakes", label: "Mistakes", suffix: "/mistakes" },
      { id: "review", label: "Review", suffix: "/review" },
      { id: "goals", label: "Goals", suffix: "/goals" },
      { id: "log", label: "Log", suffix: "/log" },
    ],
  },
];

const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

function BrandMark() {
  return (
    <Link
      href="/projects"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1A1A17] font-serif text-sm text-white">
        I
      </span>
      <span className="font-serif text-[18px] tracking-[-0.01em] text-[#1A1A17]">
        Ivvy
      </span>
    </Link>
  );
}

export default function ProjectShell({
  projectId,
  active,
  children,
  width = "max-w-6xl",
}: {
  projectId: string;
  active: ProjectNavId;
  children: ReactNode;
  width?: string;
}) {
  const base = `/projects/${projectId}`;

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Desktop sidebar — fixed, full height */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#E7E3DA] bg-[#F4F1EA]/70 px-5 py-7 lg:flex">
        <BrandMark />

        <Link
          href="/projects"
          className="mt-6 inline-flex h-8 items-center gap-1.5 self-start rounded-full pr-2 text-xs font-medium text-[#56524B] transition-colors duration-200 hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
        >
          <span aria-hidden="true">&larr;</span> All projects
        </Link>

        <nav className="mt-7 flex-1 space-y-6 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B968D]">
                {group.heading}
              </p>
              <ul className="mt-2 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={`${base}${item.suffix}`}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex h-9 items-center rounded-lg px-3 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F1EA] ${
                          isActive
                            ? "bg-[#1A1A17] font-medium text-white"
                            : "text-[#56524B] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar + horizontal nav */}
      <div className="sticky top-0 z-30 border-b border-[#E7E3DA] bg-[#FAF8F4]/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <BrandMark />
          <Link
            href="/projects"
            className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium text-[#56524B] transition-colors hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
          >
            All projects
          </Link>
        </div>
        <div className="-mb-px flex gap-1 overflow-x-auto px-4 pb-2">
          {ALL_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={`${base}${item.suffix}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4] ${
                  isActive
                    ? "bg-[#1A1A17] font-medium text-white"
                    : "text-[#56524B] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content — fills remaining width beside the sidebar */}
      <div className="lg:pl-64">
        <main className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className={`mx-auto ${width}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
