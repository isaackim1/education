"use client";

import Link from "next/link";
import ProjectCard from "@/components/project/ProjectCard";
import { useProjects } from "@/hooks/useProjects";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium shrink-0 transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

export default function ProjectsPage() {
  const { projects, isLoaded, deleteProject } = useProjects();

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
              Your training projects
            </h1>
            <p className="text-sm text-[#5F6368] mt-2 max-w-md">
              One exam per project. Topics, materials, chat, mistakes, and review
              live together in each workspace.
            </p>
          </div>
          <Link href="/projects/new" className={PRIMARY_ACTION}>
            New project
          </Link>
        </header>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-[#E1E3E1] bg-white px-6 py-14 text-center">
            <h2 className="text-base font-medium text-[#1F1F1F]">
              No projects yet
            </h2>
            <p className="text-sm text-[#5F6368] mt-2 mx-auto max-w-sm">
              Create your first exam training project. Each one holds your topics,
              materials, training chat, mistake bank, and review queue for a single
              exam.
            </p>
            <Link
              href="/projects/new"
              className={`${PRIMARY_ACTION} mt-6`}
            >
              New project
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} onDelete={deleteProject} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
