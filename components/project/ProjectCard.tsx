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
    <article className="border border-neutral-200 rounded p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-black">{project.name}</h2>
        <p className="text-sm text-neutral-600">{project.subject}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium text-neutral-500">Exam date</dt>
          <dd className="text-black mt-0.5">{formatDate(project.examDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-neutral-500">Target grade</dt>
          <dd className="text-black mt-0.5">{project.targetGrade}</dd>
        </div>
      </dl>

      <p className="text-xs text-neutral-500">
        {formatLastStudied(project.lastStudiedAt)}
      </p>

      <div className="flex items-center justify-between gap-4 pt-1">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
        >
          Open project
        </Link>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="text-sm text-neutral-500 hover:text-black transition-colors"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
