"use client";

import Link from "next/link";
import ProjectShell from "@/components/project/ProjectShell";
import {
  CenteredNotice,
  EmptyState,
  PageHeader,
  PageShell,
  primaryAction,
  SectionHeader,
  StatusPill,
} from "@/components/ui/primitives";
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
    title: "Study sheet",
    description: "Turn topic material into a structured summary.",
    suffix: "/study/sheet",
    action: "Generate study sheet",
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
    title: "Focus session",
    description: "Study in a focused block and log the session.",
  },
];

export default function ProjectStudyPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded } = useProject(params.projectId);

  if (!isLoaded) {
    return <CenteredNotice>Loading study modes…</CenteredNotice>;
  }

  if (!project) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link
          href="/projects"
          className="mt-4 inline-flex h-9 -ml-3 items-center rounded-full px-3 text-sm text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
        >
          Back to projects
        </Link>
      </PageShell>
    );
  }

  return (
    <ProjectShell projectId={params.projectId} active="study">
      <PageHeader
        eyebrow="Study cockpit"
        title="More than a chat. A study system."
        description={`Train, Teach Back, Study Sheet, and Mistakes work from the same topic map and materials in ${project.name}. Each mode has a distinct role in getting you exam-ready.`}
      />

      {topics.length === 0 ? (
        <EmptyState
          title="Build your training workspace first"
          description="Upload your material once and Ivvy organizes it into a topic map you can train against."
          action={
            <Link
              href={`/projects/${params.projectId}/import`}
              className={primaryAction}
            >
              Upload materials
            </Link>
          }
        />
      ) : (
        <div className="space-y-12">
          <section aria-labelledby="active-study-modes">
            <SectionHeader
              eyebrow="Available now"
              title="Four ways to train"
              description="Continue from your current topic map and materials."
            />

            <div className="grid gap-px overflow-hidden rounded-2xl border border-[#E7E3DA] bg-[#E7E3DA] sm:grid-cols-2">
              {ACTIVE_MODES.map((mode, index) => (
                <Link
                  key={mode.title}
                  href={`/projects/${params.projectId}${mode.suffix}`}
                  className="group flex flex-col bg-white p-6 transition-colors duration-200 hover:bg-[#FBFAF7] focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A1A17]"
                >
                  <span className="font-serif text-sm text-[#A8A299] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-serif text-[20px] leading-tight tracking-[-0.01em] text-[#1A1A17]">
                    {mode.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
                    {mode.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1A17]">
                    {mode.action}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="coming-soon-study-modes">
            <SectionHeader
              eyebrow="On the roadmap"
              title="Coming soon"
              description="Additional ways to work with your topic materials."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {COMING_SOON_MODES.map((mode) => (
                <article
                  key={mode.title}
                  className="rounded-2xl border border-dashed border-[#D8D3C8] bg-white p-6"
                >
                  <StatusPill>Coming soon</StatusPill>
                  <h3 className="mt-4 font-serif text-[20px] leading-tight tracking-[-0.01em] text-[#1A1A17]">
                    {mode.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#56524B]">
                    {mode.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </ProjectShell>
  );
}
