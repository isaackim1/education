"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CenteredNotice,
  primaryAction,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { useProjects } from "@/hooks/useProjects";
import {
  deriveAttentionItems,
  deriveProjectSummary,
  type ProjectSummary,
} from "@/lib/project-summary";
import {
  ensureSessionForExistingData,
  signOut,
  type LocalUser,
} from "@/lib/session";

function formatExamDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function activityLabel(days: number | null): string {
  if (days === null) return "Not yet";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function ReadinessCell({ summary }: { summary: ProjectSummary }) {
  const filled = Math.min(4, Math.round(summary.readiness.score / 25));
  return (
    <div>
      <p className="text-sm text-[#1A1A17]">{summary.readiness.band}</p>
      <div className="mt-1.5 flex w-16 gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < filled ? "bg-[#1E4634]" : "bg-[#E7E3DA]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoaded, deleteProject } = useProjects();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const session = ensureSessionForExistingData(projects.length > 0);
    setUser(session);
    setSessionChecked(true);
  }, [isLoaded, projects.length, router]);

  const summaries = useMemo(
    () =>
      isLoaded
        ? projects
            .map((project) => deriveProjectSummary(project))
            .sort((a, b) => {
              const aDays = a.examDays ?? Number.POSITIVE_INFINITY;
              const bDays = b.examDays ?? Number.POSITIVE_INFINITY;
              return aDays - bDays;
            })
        : [],
    [projects, isLoaded]
  );

  const attention = useMemo(
    () => deriveAttentionItems(summaries),
    [summaries]
  );

  if (!isLoaded || !sessionChecked) {
    return <CenteredNotice>Loading…</CenteredNotice>;
  }

  const nextExam = summaries.find((s) => s.examDays !== null);
  const metaParts = [
    `${projects.length} project${projects.length === 1 ? "" : "s"}`,
  ];
  if (nextExam && nextExam.examDays !== null) {
    metaParts.push(
      nextExam.examDays === 0
        ? "next exam is today"
        : `next exam in ${nextExam.examDays} day${
            nextExam.examDays === 1 ? "" : "s"
          }`
    );
  }

  function handleDelete(summary: ProjectSummary) {
    if (
      window.confirm(
        `Delete "${summary.project.name}"? Its materials, mistakes, and history in this browser will be removed.`
      )
    ) {
      deleteProject(summary.project.id);
    }
  }

  return (
    <main className="relative isolate min-h-screen bg-[#FAF8F4]">
      <div className="ambient-wash" aria-hidden="true" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-[#E7E3DA]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
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
          <div className="flex items-center gap-4 text-sm text-[#56524B]">
            {user ? (
              <>
                <span className="hidden sm:inline">{user.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                  className="rounded-md px-2 py-1 transition-colors hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-2 py-1 transition-colors hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634]"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        {/* Header row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[#1A1A17] sm:text-[32px]">
              Your exams
            </h1>
            <p className="mt-2 text-sm text-[#56524B]">
              {metaParts.join(" · ")}
            </p>
          </div>
          <Link href="/projects/new" className={primaryAction}>
            New exam project
          </Link>
        </div>

        {/* Needs attention — at most three sentence-rows */}
        {attention.length > 0 ? (
          <Reveal className="mt-8">
            <section aria-label="Needs attention">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
                Needs attention
              </p>
              <ul className="mt-2 divide-y divide-[#EFEBE2] border-y border-[#E7E3DA]">
                {attention.map((item) => (
                  <li
                    key={`${item.projectId}-${item.actionLabel}`}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <p className="text-[15px] text-[#1A1A17]">
                      {item.sentence}
                    </p>
                    <Link
                      href={item.href}
                      className="shrink-0 text-sm font-medium text-[#1E4634] underline-offset-2 hover:underline"
                    >
                      {item.actionLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ) : null}

        {/* Projects table / empty state */}
        {projects.length === 0 ? (
          <Reveal className="mt-16">
            <div className="mx-auto max-w-md text-center">
              <h2 className="text-[20px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
                Create your first exam project.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#56524B]">
                Tell Ivvy the exam and the date, then upload your notes,
                slides, or past papers. Ivvy organizes them into topics and
                starts coaching you.
              </p>
              <div className="mt-7 flex justify-center">
                <Link href="/projects/new" className={primaryAction}>
                  New exam project
                </Link>
              </div>
              <p className="mt-10 text-sm leading-relaxed text-[#9B968D]">
                Upload once. Ivvy organizes. Train daily.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal className="mt-8">
            <div className="overflow-x-auto rounded-xl border border-[#E7E3DA] bg-white">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-[#E7E3DA]">
                    {[
                      "Exam",
                      "Date",
                      "Days left",
                      "Readiness",
                      "Due",
                      "Weak topics",
                      "Last activity",
                      "",
                    ].map((label, index) => (
                      <th
                        key={label || "actions"}
                        scope="col"
                        className={`px-4 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#7A766D] first:pl-5 last:pr-5 ${
                          index >= 2 && index <= 5 ? "text-right" : ""
                        }`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE2]">
                  {summaries.map((summary) => {
                    const { project } = summary;
                    const daysLeftUrgent =
                      summary.examDays !== null && summary.examDays <= 3;
                    return (
                      <tr
                        key={project.id}
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="group cursor-pointer transition-colors hover:bg-[#FBFAF7]"
                      >
                        <td className="px-4 py-4 first:pl-5">
                          <p className="text-sm font-medium text-[#1A1A17]">
                            {project.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#7A766D]">
                            {project.subject}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#56524B]">
                          {formatExamDate(project.examDate)}
                        </td>
                        <td
                          className={`px-4 py-4 text-right text-sm tabular-nums ${
                            daysLeftUrgent
                              ? "font-medium text-[#1A1A17]"
                              : "text-[#1A1A17]"
                          }`}
                        >
                          {summary.examDays ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <ReadinessCell summary={summary} />
                          </div>
                        </td>
                        <td
                          className={`px-4 py-4 text-right text-sm tabular-nums ${
                            summary.dueCount > 0
                              ? "font-semibold text-[#1A1A17]"
                              : "text-[#7A766D]"
                          }`}
                        >
                          {summary.dueCount}
                        </td>
                        <td className="px-4 py-4 text-right text-sm tabular-nums text-[#56524B]">
                          {summary.weakTopicCount}
                        </td>
                        <td className="px-4 py-4 text-sm text-[#56524B]">
                          {activityLabel(summary.daysSinceActivity)}
                        </td>
                        <td className="px-4 py-4 pr-5 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(summary);
                            }}
                            className="rounded-md px-2 py-1 text-xs text-[#9B968D] opacity-0 transition-opacity hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
