"use client";

import Link from "next/link";
import ProjectCard from "@/components/project/ProjectCard";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const { projects, isLoaded, deleteProject } = useProjects();

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading study projects...</p>
      </main>
    );
  }

  if (projects.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Study projects
            </h1>
            <p className="text-sm text-neutral-600 mt-2">
              A study project stores your exam info, materials, chat history,
              mistakes, and progress in one focused workspace.
            </p>
          </header>
          <Link
            href="/projects/new"
            className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
          >
            Create study project
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Study projects
            </h1>
            <p className="text-sm text-neutral-600 mt-2 max-w-md">
              Each project becomes a focused AI training workspace for one exam
              or subject.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center border border-neutral-300 text-sm font-medium px-4 py-2 rounded hover:border-black transition-colors text-black shrink-0"
          >
            Create study project
          </Link>
        </header>

        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} onDelete={deleteProject} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
