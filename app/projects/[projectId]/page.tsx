"use client";

import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projects, isLoaded } = useProjects();
  const project = projects.find((item) => item.id === params.projectId);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading study project...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-block text-sm text-neutral-500 hover:text-black transition-colors mt-4"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/projects"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          Back to projects
        </Link>

        <header className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            {project.name}
          </h1>
          <p className="text-sm text-neutral-600 mt-2">{project.subject}</p>
        </header>

        <dl className="grid grid-cols-2 gap-4 border-y border-neutral-200 py-4 my-6">
          <div>
            <dt className="text-xs font-medium text-neutral-500">Exam date</dt>
            <dd className="text-sm text-black mt-1">
              {formatDate(project.examDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-500">
              Target grade
            </dt>
            <dd className="text-sm text-black mt-1">{project.targetGrade}</dd>
          </div>
        </dl>

        <p className="text-sm text-neutral-600">
          This project will become your AI training workspace for this exam.
        </p>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            disabled
            className="border border-neutral-200 text-sm text-neutral-400 px-4 py-2 rounded cursor-not-allowed"
          >
            Add materials
          </button>
          <button
            type="button"
            disabled
            className="border border-neutral-200 text-sm text-neutral-400 px-4 py-2 rounded cursor-not-allowed"
          >
            Start chat
          </button>
        </div>
      </div>
    </main>
  );
}
