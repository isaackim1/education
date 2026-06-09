"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { getProjectMistakes } from "@/lib/project-storage";
import type { Mistake } from "@/lib/types";

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
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hasSavedMaterials(
  materials: { content: string }[]
): boolean {
  return materials.some((m) => m.content.trim().length > 0);
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded: projectLoaded } = useProject(
    params.projectId
  );
  const { materials, isLoaded: materialsLoaded } = useProjectMaterials(
    params.projectId
  );
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);

  const refreshMistakes = useCallback(() => {
    setMistakes(getProjectMistakes(params.projectId));
  }, [params.projectId]);

  useEffect(() => {
    refreshMistakes();
    setMistakesLoaded(true);
  }, [refreshMistakes]);

  const isLoaded = projectLoaded && materialsLoaded && mistakesLoaded;

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

  const materialsWithContent = materials.filter(
    (m) => m.content.trim().length > 0
  );
  const hasTopics = topics.length > 0;
  const hasMaterials = hasSavedMaterials(materials);
  const unreviewedCount = mistakes.filter((m) => !m.reviewed).length;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ProjectWorkspaceNav
          projectId={params.projectId}
          active="overview"
        />

        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            {project.name}
          </h1>
          <p className="text-sm text-neutral-600 mt-2">{project.subject}</p>
          <p className="text-sm text-neutral-600 mt-4">
            This project is your AI training workspace for this exam.
          </p>
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

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-neutral-200 rounded p-3">
            <p className="text-xs font-medium text-neutral-500">Topics</p>
            <p className="text-sm text-black mt-1">{topics.length}</p>
          </div>
          <div className="border border-neutral-200 rounded p-3">
            <p className="text-xs font-medium text-neutral-500">Materials</p>
            <p className="text-sm text-black mt-1">
              {materialsWithContent.length}
            </p>
          </div>
          <div className="border border-neutral-200 rounded p-3">
            <p className="text-xs font-medium text-neutral-500">Last studied</p>
            <p className="text-sm text-black mt-1">
              {formatLastStudied(project.lastStudiedAt)}
            </p>
          </div>
        </div>

        <section className="border border-neutral-200 rounded p-4 mb-6">
          <h2 className="text-sm font-semibold text-black">Mistakes</h2>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs font-medium text-neutral-500">Saved</p>
              <p className="text-sm text-black mt-1">{mistakes.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Unreviewed</p>
              <p className="text-sm text-black mt-1">{unreviewedCount}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href={`/projects/${params.projectId}/mistakes`}
              className="text-sm text-neutral-500 hover:text-black transition-colors"
            >
              Mistake bank
            </Link>
            {mistakes.length > 0 ? (
              <Link
                href={`/projects/${params.projectId}/review`}
                className="text-sm text-neutral-500 hover:text-black transition-colors"
              >
                Review mistakes
              </Link>
            ) : null}
          </div>
        </section>

        <section className="border border-neutral-200 rounded p-4">
          <h2 className="text-sm font-semibold text-black">Next action</h2>

          {!hasTopics ? (
            <div className="mt-3">
              <p className="text-sm text-neutral-600">
                Add the topics your exam covers before dumping materials.
              </p>
              <Link
                href={`/projects/${params.projectId}/setup`}
                className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors mt-4"
              >
                Add your exam topics
              </Link>
            </div>
          ) : !hasMaterials ? (
            <div className="mt-3">
              <p className="text-sm text-neutral-600">
                Paste your notes and past questions so Ivvy knows what to train
                you on.
              </p>
              <Link
                href={`/projects/${params.projectId}/materials`}
                className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors mt-4"
              >
                Add your study materials
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <Link
                href={`/projects/${params.projectId}/chat`}
                className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
              >
                Start training
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
