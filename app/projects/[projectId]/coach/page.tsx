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
} from "@/components/ui/primitives";
import { useProject } from "@/hooks/useProject";

/**
 * Coach — the single AI tutor/trainer workspace.
 *
 * Consolidates what used to be four separate sidebar routes (Study, Train,
 * Chat, Review) into one guided learning space. Each mode still lives at its
 * own route for now, but the student only ever navigates to Coach and picks a
 * way to work from here.
 */

type CoachMode = {
  title: string;
  description: string;
  suffix: string;
  action: string;
};

const PRACTICE_MODES: CoachMode[] = [
  {
    title: "Practice weak topics",
    description:
      "Answer exam-style questions with feedback. Ivvy remembers what you miss.",
    suffix: "/train",
    action: "Continue training",
  },
  {
    title: "Exam-style practice",
    description:
      "Teach a topic back in your own words and let Ivvy find the gaps.",
    suffix: "/study/teach",
    action: "Start teaching back",
  },
];

const LEARN_MODES: CoachMode[] = [
  {
    title: "Ask Ivvy",
    description:
      "Ask questions about your materials and get explanations in plain language.",
    suffix: "/chat",
    action: "Ask a question",
  },
  {
    title: "Build a study sheet",
    description: "Turn topic material into a structured, exam-ready summary.",
    suffix: "/study/sheet",
    action: "Generate study sheet",
  },
];

const REVIEW_MODES: CoachMode[] = [
  {
    title: "Review mistakes",
    description: "Revisit saved mistakes and close the gaps before your exam.",
    suffix: "/mistakes",
    action: "Open mistake bank",
  },
  {
    title: "Spaced review",
    description:
      "Work through the review queue so weak areas resurface at the right time.",
    suffix: "/review",
    action: "Start review",
  },
];

function ModeGrid({
  projectId,
  modes,
  startIndex,
}: {
  projectId: string;
  modes: CoachMode[];
  startIndex: number;
}) {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-[#E7E3DA] bg-[#E7E3DA] sm:grid-cols-2">
      {modes.map((mode, index) => (
        <Link
          key={mode.title}
          href={`/projects/${projectId}${mode.suffix}`}
          className="group flex flex-col bg-white p-6 transition-colors duration-200 hover:bg-[#FBFAF7] focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A1A17]"
        >
          <span className="font-serif text-sm text-[#A8A299] tabular-nums">
            {String(startIndex + index + 1).padStart(2, "0")}
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
  );
}

export default function ProjectCoachPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded } = useProject(params.projectId);

  if (!isLoaded) {
    return <CenteredNotice>Loading Coach…</CenteredNotice>;
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
    <ProjectShell projectId={params.projectId} active="coach">
      <PageHeader
        eyebrow="Coach"
        title="Train with your materials"
        description={`Ivvy teaches, trains, and quizzes you from the topic map and materials in ${project.name} — and remembers where you're weak. Pick a way to work.`}
      />

      {topics.length === 0 ? (
        <EmptyState
          title="Add your materials first"
          description="Ivvy coaches you from your own notes, slides, and past papers. Upload them once and Ivvy builds the topic map it trains you against."
          action={
            <Link
              href={`/projects/${params.projectId}/materials`}
              className={primaryAction}
            >
              Add materials
            </Link>
          }
        />
      ) : (
        <div className="space-y-12">
          <section aria-labelledby="coach-practice">
            <SectionHeader
              eyebrow="Practice"
              title="Train and test yourself"
              description="Active recall against your own topics and materials."
            />
            <ModeGrid
              projectId={params.projectId}
              modes={PRACTICE_MODES}
              startIndex={0}
            />
          </section>

          <section aria-labelledby="coach-learn">
            <SectionHeader
              eyebrow="Learn"
              title="Understand and summarize"
              description="Ask questions and turn material into something you can revise from."
            />
            <ModeGrid
              projectId={params.projectId}
              modes={LEARN_MODES}
              startIndex={PRACTICE_MODES.length}
            />
          </section>

          <section aria-labelledby="coach-review">
            <SectionHeader
              eyebrow="Review"
              title="Close your weak areas"
              description="Revisit the mistakes Ivvy has saved and keep them from resurfacing."
            />
            <ModeGrid
              projectId={params.projectId}
              modes={REVIEW_MODES}
              startIndex={PRACTICE_MODES.length + LEARN_MODES.length}
            />
          </section>
        </div>
      )}
    </ProjectShell>
  );
}
