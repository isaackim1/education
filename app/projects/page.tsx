"use client";

import Link from "next/link";
import ProjectCard from "@/components/project/ProjectCard";
import {
  CenteredNotice,
  EmptyState,
  PageHeader,
  PageShell,
  primaryAction,
} from "@/components/ui/primitives";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const { projects, isLoaded, deleteProject } = useProjects();

  if (!isLoaded) {
    return <CenteredNotice>Loading…</CenteredNotice>;
  }

  return (
    <PageShell width="max-w-5xl">
      <PageHeader
        eyebrow="Workspaces"
        title="Your training projects"
        description="One exam per project. Topics, materials, training, mistakes, and review live together in each workspace."
        action={
          <Link href="/projects/new" className={primaryAction}>
            New project
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first exam training project. Each one holds your topics, materials, training chat, mistake bank, and review queue for a single exam."
          action={
            <Link href="/projects/new" className={primaryAction}>
              New project
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} onDelete={deleteProject} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
