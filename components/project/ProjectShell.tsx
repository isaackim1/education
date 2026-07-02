"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { getDueProjectMistakes, getProject } from "@/lib/project-storage";
import { daysUntil } from "@/lib/dashboard-metrics";
import type { StudyProject } from "@/lib/types";

/**
 * ProjectShell — the workspace layout for everything under /projects/[id].
 *
 * A fixed left rail: brand, three-item nav (Overview / Coach / Materials),
 * and the exam countdown pinned at the bottom so exam pressure stays ambient.
 * The Coach item carries the due-review count — one of exactly two places the
 * due count appears (the other is the Overview review panel).
 */

export type ProjectNavId = "overview" | "coach" | "materials";

type NavItem = { id: ProjectNavId; label: string; suffix: string };

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "coach", label: "Coach", suffix: "/coach" },
  { id: "materials", label: "Materials", suffix: "/materials" },
];

function BrandMark() {
  return (
    <Link
      href="/projects"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1E4634] text-sm font-medium text-white">
        I
      </span>
      <span className="text-[17px] font-medium tracking-[-0.01em] text-[#1A1A17]">
        Ivvy
      </span>
    </Link>
  );
}

function formatExamDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function navItemLabel(item: NavItem, dueCount: number): ReactNode {
  if (item.id !== "coach" || dueCount <= 0) return item.label;
  return (
    <span className="flex w-full items-center justify-between">
      <span>{item.label}</span>
      <span className="text-xs tabular-nums text-current opacity-80">
        {dueCount}
      </span>
    </span>
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
  const [project, setProject] = useState<StudyProject | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    setProject(getProject(projectId));
    setDueCount(getDueProjectMistakes(projectId).length);
  }, [projectId, active]);

  const examDays = project ? daysUntil(project.examDate) : null;

  return (
    <div className="relative isolate min-h-screen bg-[#FAF8F4]">
      {/* Quiet forest ambient wash behind the workspace. */}
      <div className="ambient-wash" aria-hidden="true" />

      {/* Desktop rail — fixed, full height */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[#E7E3DA] bg-[#F4F1EA]/80 px-5 py-7 backdrop-blur-sm lg:flex">
        <BrandMark />

        <Link
          href="/projects"
          className="mt-6 inline-flex h-8 items-center gap-1.5 self-start rounded-md pr-2 text-xs font-medium text-[#56524B] transition-colors duration-200 hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
        >
          <span aria-hidden="true">&larr;</span> All projects
        </Link>

        {project ? (
          <p className="mt-6 line-clamp-2 px-3 text-sm font-medium leading-snug text-[#1A1A17]">
            {project.name}
          </p>
        ) : null}

        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`${base}${item.suffix}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-9 items-center rounded-lg px-3 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F1EA] ${
                      isActive
                        ? "bg-[#1E4634] font-medium text-white"
                        : "text-[#56524B] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
                    }`}
                  >
                    {navItemLabel(item, dueCount)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Exam pressure, ambient — pinned to the rail's bottom. */}
        {project ? (
          <div className="border-t border-[#E7E3DA] pt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B968D]">
              Exam
            </p>
            <p className="mt-1 px-3 text-sm text-[#1A1A17]">
              {formatExamDate(project.examDate)}
              {examDays !== null ? (
                <span className="text-[#56524B]">
                  {" "}
                  ·{" "}
                  <span className="tabular-nums">
                    {examDays === 0
                      ? "today"
                      : `${examDays} day${examDays === 1 ? "" : "s"} left`}
                  </span>
                </span>
              ) : null}
            </p>
          </div>
        ) : null}
      </aside>

      {/* Mobile top bar + horizontal nav */}
      <div className="sticky top-0 z-30 border-b border-[#E7E3DA] bg-[#FAF8F4]/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <BrandMark />
          <Link
            href="/projects"
            className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-[#56524B] transition-colors hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
          >
            All projects
          </Link>
        </div>
        <div className="-mb-px flex gap-1 overflow-x-auto px-4 pb-2">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={`${base}${item.suffix}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4] ${
                  isActive
                    ? "bg-[#1E4634] font-medium text-white"
                    : "text-[#56524B] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
                }`}
              >
                {item.label}
                {item.id === "coach" && dueCount > 0 ? (
                  <span className="text-xs tabular-nums opacity-80">
                    {dueCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content — fills remaining width beside the rail. */}
      <div className="relative z-10 lg:pl-60">
        <main className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
          <div className={`mx-auto ${width}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
