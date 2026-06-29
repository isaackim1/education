"use client";

import Link from "next/link";
import { useFounder } from "@/hooks/useFounder";
import { DuButton, Eyebrow } from "./ui";
import {
  EFFECTUATION_MODULE,
  EFFECTUATION_SECTION_IDS,
} from "@/data/unknown/effectuation";
import { deriveSubmissionCompleteness } from "@/lib/du/progress";

/**
 * DemoGuide (Phase 4) — a lightweight "where am I in the journey" helper.
 *
 * Infers the founder's position from existing localStorage data and points to
 * the next concrete step. Deliberately simple: a six-step applied-learning
 * sequence, the first incomplete step is "current", and Continue routes there.
 */

interface DemoStep {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

export default function DemoGuide({
  title = "Your founder journey",
  tone = "card",
  className = "",
}: {
  title?: string;
  tone?: "card" | "ink";
  className?: string;
}) {
  const { ready, profile, submission, feedforward, reflections, mentorThread, state } =
    useFounder();

  const completeness = deriveSubmissionCompleteness(
    submission,
    EFFECTUATION_SECTION_IDS,
  );
  const reflectionsDone = EFFECTUATION_MODULE.conceptIds.filter((id) =>
    (reflections[id] ?? "").trim(),
  ).length;
  const reflectionComplete =
    state?.progressState === "reflection_complete" ||
    state?.progressState === "ready_for_mentor_review" ||
    state?.progressState === "module_complete";
  const askedMentor = mentorThread.some((m) => m.role === "founder");

  const steps: DemoStep[] = [
    {
      id: "profile",
      label: "Create your venture profile",
      href: "/module/effectuation/studio",
      done: ready && Boolean(profile),
    },
    {
      id: "concepts",
      label: "Explore the effectuation concepts",
      href: "/module/effectuation/learn",
      done: ready && reflectionsDone > 0,
    },
    {
      id: "roadmap",
      label: "Build your working roadmap",
      href: "/module/effectuation/studio",
      done: ready && completeness.filled > 0,
    },
    {
      id: "feedforward",
      label: "Generate feed-forward",
      href: "/module/effectuation/studio",
      done: ready && Boolean(feedforward),
    },
    {
      id: "progress",
      label: "Review your progress journey",
      href: "/progress",
      done: ready && reflectionComplete,
    },
    {
      id: "mentor",
      label: "Ask the mentor before review",
      href: "/mentor",
      done: ready && askedMentor,
    },
  ];

  const currentIndex = steps.findIndex((s) => !s.done);
  const current = currentIndex === -1 ? null : steps[currentIndex];
  const completed = steps.filter((s) => s.done).length;

  const onDark = tone === "ink";
  const surface = onDark
    ? "bg-[#0B0B0C] border-[#0B0B0C] text-white"
    : "bg-white border-[#E2DCCD] text-[#0B0B0C]";

  return (
    <section className={`rounded-xl border p-5 sm:p-6 ${surface} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow onDark={onDark}>{title}</Eyebrow>
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
            onDark ? "text-white/55" : "text-[#8A8579]"
          }`}
        >
          {ready ? `${completed}/${steps.length} done` : "—"}
        </span>
      </div>

      <ol className="mt-4 space-y-1.5">
        {steps.map((step, i) => {
          const isCurrent = current?.id === step.id;
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isCurrent
                    ? "bg-[#F5D11E] text-[#0B0B0C]"
                    : onDark
                      ? "hover:bg-white/[0.06]"
                      : "hover:bg-[#F3F0E6]"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                    step.done
                      ? "bg-[#137333] text-white"
                      : isCurrent
                        ? "bg-[#0B0B0C] text-[#F5D11E]"
                        : onDark
                          ? "bg-white/10 text-white/70"
                          : "bg-[#EDE8DA] text-[#8A8579]"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-[#0B0B0C]"
                      : step.done
                        ? onDark
                          ? "text-white/60"
                          : "text-[#8A8579]"
                        : onDark
                          ? "text-white/85"
                          : "text-[#3A372F]"
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent ? (
                  <span className="ml-auto text-[11px] font-black uppercase tracking-[0.12em]">
                    You&apos;re here
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-5">
        <DuButton
          href={current?.href ?? "/mentor"}
          variant={onDark ? "accent" : "primary"}
        >
          {current ? `Continue: ${current.label} →` : "Journey complete — ask your mentor →"}
        </DuButton>
      </div>
    </section>
  );
}
