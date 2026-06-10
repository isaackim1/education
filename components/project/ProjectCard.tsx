"use client";

import Link from "next/link";
import type { StudyProject } from "@/lib/types";

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLastStudied(lastStudiedAt: string | null): string {
  if (!lastStudiedAt) return "Not studied yet";
  const date = new Date(lastStudiedAt);
  if (Number.isNaN(date.getTime())) return "Not studied yet";
  return `Last studied ${date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

export default function ProjectCard({
  project,
  onDelete,
}: {
  project: StudyProject;
  onDelete?: (projectId: string) => void;
}) {
  return (
    <article className="h-full flex flex-col gap-4 rounded-2xl border border-[#E1E3E1] bg-white p-5 transition-shadow hover:shadow-[0_1px_3px_rgba(60,64,67,0.16)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-[#1F1F1F]">{project.name}</h2>
        <p className="text-sm text-[#5F6368]">{project.subject}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium text-[#5F6368]">Exam date</dt>
          <dd className="text-[#1F1F1F] mt-0.5">{formatDate(project.examDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[#5F6368]">Target grade</dt>
          <dd className="text-[#1F1F1F] mt-0.5">{project.targetGrade}</dd>
        </div>
      </dl>

      <p className="text-xs text-[#5F6368]">
        {formatLastStudied(project.lastStudiedAt)}
      </p>

      <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
        >
          Open project
        </Link>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="inline-flex items-center h-9 px-3 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#B3261E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
