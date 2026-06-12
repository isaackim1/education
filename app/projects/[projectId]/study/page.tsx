"use client";

import Link from "next/link";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";

const ACTIVE_MODES = [
  {
    title: "Train with questions",
    description: "Practice exam-style questions with feedback.",
    suffix: "/train",
    action: "Start training",
  },
  {
    title: "Teach back",
    description: "Explain a topic and let Ivvy find the gaps.",
    suffix: "/study/teach",
    action: "Start teaching back",
  },
  {
    title: "Review mistakes",
    description: "Revisit saved mistakes and close gaps.",
    suffix: "/mistakes",
    action: "Open mistake bank",
  },
];

const COMING_SOON_MODES = [
  {
    title: "Study sheet",
    description: "Turn topic material into a structured summary.",
  },
  {
    title: "Focus session",
    description: "Study in a focused block and log the session.",
  },
];

const PRIMARY_ACTION =
  "inline-flex h-10 items-center justify-center rounded-full bg-[#1F1F1F] px-6 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

export default function ProjectStudyPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded } = useProject(params.projectId);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD]">
        <p className="text-sm text-[#5F6368]">Loading study modes...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="mx-auto max-w-lg px-4 py-12">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Project not found
          </h1>
          <Link href="/projects" className={BACK_LINK}>
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="study" />

        <header className="mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Study modes
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5F6368]">
            Choose a focused way to train in {project.name}. Each mode uses the
            same topic map and workspace materials.
          </p>
        </header>

        {topics.length === 0 ? (
          <section className="rounded-2xl border border-[#E1E3E1] bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Build your training workspace first
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5F6368]">
              Upload materials first to build your training workspace.
            </p>
            <Link
              href={`/projects/${params.projectId}/import`}
              className={`${PRIMARY_ACTION} mt-6`}
            >
              Upload materials
            </Link>
          </section>
        ) : (
          <div className="space-y-8">
            <section aria-labelledby="active-study-modes">
              <div className="mb-4">
                <h2
                  id="active-study-modes"
                  className="text-base font-semibold text-[#1F1F1F]"
                >
                  Available now
                </h2>
                <p className="mt-1 text-sm text-[#5F6368]">
                  Continue training from your current topic map.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {ACTIVE_MODES.map((mode) => (
                  <Link
                    key={mode.title}
                    href={`/projects/${params.projectId}${mode.suffix}`}
                    className="group rounded-2xl border border-[#E1E3E1] bg-white p-5 transition-colors hover:border-[#C4C7C5] hover:bg-[#FDFDFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
                  >
                    <h3 className="text-base font-semibold text-[#1F1F1F]">
                      {mode.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#5F6368]">
                      {mode.description}
                    </p>
                    <span className="mt-5 inline-flex text-sm font-medium text-[#1F1F1F] underline decoration-[#C4C7C5] underline-offset-4 group-hover:decoration-[#1F1F1F]">
                      {mode.action}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-labelledby="coming-soon-study-modes">
              <div className="mb-4">
                <h2
                  id="coming-soon-study-modes"
                  className="text-base font-semibold text-[#1F1F1F]"
                >
                  Coming soon
                </h2>
                <p className="mt-1 text-sm text-[#5F6368]">
                  Additional ways to work with your topic materials.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {COMING_SOON_MODES.map((mode) => (
                  <article
                    key={mode.title}
                    className="rounded-2xl border border-[#E1E3E1] bg-white p-5"
                  >
                    <span className="inline-flex rounded-full bg-[#F1F3F4] px-2.5 py-1 text-xs font-medium text-[#5F6368]">
                      Coming soon
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-[#1F1F1F]">
                      {mode.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#5F6368]">
                      {mode.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
